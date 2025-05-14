'use client';

import { useEffect, useState, useRef } from 'react';
import { useStep } from '../StepContext';
import { useDisconnect, useAccount, useWalletClient } from 'wagmi';
import { useAccountsAvailable, useLogin, useSessionClient } from '@lens-protocol/react';
import IconAt from '@icon/at.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteCookie, getCookies } from 'cookies-next';
import { getLensClient } from '@/lib/lens/client';

const resolveImage = (picture: any): string => {
  if (!picture) return '/media/placeholders/profile.png';
  if (typeof picture === 'string') return picture;

  const uri = picture?.optimized?.uri || picture?.original?.uri || picture?.uri || picture?.original?.url || '';
  if (!uri) return '/media/placeholders/profile.png';

  return uri;
};

const Select = () => {
  const { next, setStepIndex } = useStep();
  const { disconnect } = useDisconnect();
  const { address: walletAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const {
    data: availableAccounts,
    loading: accountsLoading,
    error: accountsError,
  } = useAccountsAvailable({
    managedBy: walletClient?.account.address ?? '',
  });
  const { execute: authenticate, loading: authenticating, error: authError } = useLogin();
  const { data: session, loading: sessionLoading } = useSessionClient();
  const [authenticatingAccount, setAuthenticatingAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasCleanedSession = useRef(false);
  const manuallyAuthenticated = useRef(false);

  useEffect(() => {
    const cleanupOldSessions = async () => {
      const sessionCleaned = sessionStorage.getItem('lens_session_cleaned');
      if (sessionCleaned === 'false') {
        hasCleanedSession.current = false;
        sessionStorage.removeItem('lens_session_cleaned');
      }

      if (hasCleanedSession.current) return;

      try {
        const client = await getLensClient();

        if (client.isSessionClient()) {
          await client.logout();

          const cookies = getCookies();
          for (const cookieName in cookies) {
            if (cookieName.toLowerCase().includes('lens')) {
              deleteCookie(cookieName);
            }
          }

          hasCleanedSession.current = true;
        }
      } catch (error) {}
    };

    cleanupOldSessions();
  }, []);

  useEffect(() => {
    if (sessionLoading) return;

    if (session && authenticatingAccount && manuallyAuthenticated.current) {
      setAuthenticatingAccount(null);
      next();
    }
  }, [session, sessionLoading, authenticatingAccount, next]);

  const handleSelect = async (accountWrapper: any) => {
    setError(null);
    manuallyAuthenticated.current = false;

    if (!walletClient || !walletAddress) {
      setError('Wallet connection is missing');
      return;
    }

    const account = accountWrapper.account;
    setAuthenticatingAccount(account.address);

    try {
      const isOwner = walletAddress.toLowerCase() === account.owner?.toLowerCase();

      const appAddress = process.env.NEXT_PUBLIC_APP_ADDRESS;
      if (!appAddress) {
        throw new Error('App address is not defined');
      }

      const authRequest = isOwner
        ? {
            accountOwner: {
              account: account.address,
              app: appAddress,
              owner: walletClient.account.address,
            },
          }
        : {
            accountManager: {
              account: account.address,
              app: appAddress,
              manager: walletClient.account.address,
            },
          };

      const result = await authenticate({
        ...authRequest,
        signMessage: async (message: string) => {
          return await walletClient.signMessage({ message });
        },
      });

      manuallyAuthenticated.current = true;

      if (session && !sessionLoading) {
        setAuthenticatingAccount(null);
        next();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setAuthenticatingAccount(null);
      manuallyAuthenticated.current = false;
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="bg-blue/10 text-blue flex aspect-square w-14 items-center justify-center rounded-full text-[32px]">
          <IconAt />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="font-openrunde text-[24px] leading-[32px] font-semibold tracking-[-0.48px] text-neutral-800">Choose your account</p>
        <p className="max-w-[384px] text-center leading-[24px] text-neutral-600">Choose Lens account you want to sign in to.</p>
      </div>

      {error && (
        <div className="mx-6 my-2 rounded-lg border border-red-300 bg-red-100 p-3 text-red-800">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-4 flex w-full flex-col gap-2 px-6">
        <AnimatePresence mode="wait">
          {accountsLoading ? (
            <motion.div key="loading-skeleton" exit={{ opacity: 0, transition: { duration: 0.2 } }} className="flex w-full flex-col gap-2">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex w-full animate-pulse items-center gap-4 rounded-[24px] bg-neutral-200 p-3">
                  <div className="h-[56px] w-[56px] flex-none rounded-[12px] bg-neutral-300" />
                  <div className="flex w-full flex-col gap-1">
                    <div className="h-6 w-1/3 rounded bg-neutral-300" />
                    <div className="h-6 w-2/3 rounded bg-neutral-300" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : availableAccounts?.items && availableAccounts.items.length > 0 ? (
            <motion.div key="accounts-list" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.3 } }} className="flex w-full flex-col gap-2">
              {availableAccounts.items.map((accWrapper: any) => {
                const acc = accWrapper.account;
                const handle = acc.username?.localName || acc.handle || acc.metadata?.localName || acc.address.slice(0, 6) + '...';
                const image = resolveImage(acc.metadata?.picture);
                const isThisAccountAuthenticating = authenticatingAccount === acc.address;

                return (
                  <motion.button
                    key={acc.address}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    onClick={() => handleSelect(accWrapper)}
                    disabled={authenticating || isThisAccountAuthenticating}
                    className={`flex w-full cursor-pointer items-center gap-4 rounded-[24px] bg-neutral-200 p-3 transition transition-all duration-200 ease-out hover:bg-neutral-300 active:scale-[0.99] ${authenticating || isThisAccountAuthenticating ? 'cursor-not-allowed opacity-70' : ''} `}>
                    <div className="aspect-square h-[56px] flex-none overflow-hidden rounded-[12px] bg-neutral-300">
                      <img src={image} className="h-full w-full object-cover" alt={`${handle}'s profile picture`} />
                    </div>
                    <div className="flex flex-col items-start gap-1 text-neutral-800">
                      <p className="h-6 overflow-hidden text-[18px] leading-[24px] font-medium">
                        <span className="text-neutral-500">@</span>
                        {handle}
                      </p>
                      <p className="line-clamp-1 h-6 w-full overflow-hidden text-start leading-[24px] text-neutral-600">
                        {isThisAccountAuthenticating ? 'Authenticating...' : acc.metadata?.name || 'Lens Profile'}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="no-accounts-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
              className="flex w-full justify-center p-4 text-center text-neutral-500">
              No Lens accounts found for this wallet.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={handleDisconnect} className="cursor-pointer text-[14px] leading-[20px] text-neutral-600">
        <span className="text-neutral-500">or</span> change wallet
      </button>
    </>
  );
};

export default Select;
