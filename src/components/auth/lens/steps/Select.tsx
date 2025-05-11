'use client';

import { useEffect, useState } from 'react';
import { useStep } from '../StepContext';
import { useDisconnect, useAccount, useWalletClient } from 'wagmi';
import { useAccountsAvailable, useLogin, useSessionClient } from '@lens-protocol/react';
import IconAt from '@icon/at.svg';
import { motion, AnimatePresence } from 'framer-motion';

const resolveImage = (picture: any): string => {
  if (!picture) return '/media/placeholders/profile.png';
  if (typeof picture === 'string') return picture;

  const uri = picture?.optimized?.uri || picture?.original?.uri || picture?.uri || picture?.original?.url || '';
  if (!uri) return '/media/placeholders/profile.png';

  return uri;
};

const Select = () => {
  const { next } = useStep();
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

  useEffect(() => {
    console.log('Session data:', session);
    console.log('Authentication error:', authError);
    console.log('Accounts error:', accountsError);

    if (!process.env.NEXT_PUBLIC_APP_ADDRESS) {
      console.error('NEXT_PUBLIC_APP_ADDRESS environment variable is missing');
      setError('Application address configuration is missing');
    }
  }, [session, authError, accountsError]);

  useEffect(() => {
    if (session && authenticatingAccount) {
      console.log('Successfully authenticated with Lens');
      next();
    }
  }, [session, authenticatingAccount, next]);

  const handleSelect = async (accountWrapper: any) => {
    setError(null);

    if (!walletClient || !walletAddress) {
      setError('Wallet connection is missing');
      return;
    }

    const account = accountWrapper.account;
    setAuthenticatingAccount(account.address);

    try {
      console.log('Starting authentication for account:', account.address);
      console.log('Wallet address:', walletAddress);
      console.log('Account owner:', account.owner);

      const isOwner = walletAddress.toLowerCase() === account.owner?.toLowerCase();
      console.log('Is owner?', isOwner);

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

      console.log('Auth request:', authRequest);

      const result = await authenticate({
        ...authRequest,
        signMessage: async (message: string) => {
          console.log('Signing message:', message);
          return await walletClient.signMessage({ message });
        },
      });

      console.log('Authentication result:', result);

      if (session) {
        console.log('Session after authentication:', session);
        next();
      } else {
        console.log('No session after authentication, waiting for session update');
      }
    } catch (err) {
      console.error('Authentication error details:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setAuthenticatingAccount(null);
    }
  };

  useEffect(() => {
    if (authError) {
      setError(`Authentication error: ${authError.message || authError}`);
    }
  }, [authError]);

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-center w-14 aspect-square bg-blue/10 text-blue rounded-full text-[32px]">
          <IconAt />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-[24px] font-semibold leading-[32px] text-neutral-800 font-openrunde">Choose your account</p>
        <p className="text-neutral-600 leading-[24px] max-w-[384px] text-center">Choose Lens account you want to sign in to.</p>
      </div>

      {error && (
        <div className="mx-6 p-3 my-2 bg-red-100 border border-red-300 text-red-800 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col w-full px-6 gap-2 mt-4">
        {accountsLoading && (
          <>
            {[1, 2].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-[24px] w-full bg-neutral-200 animate-pulse">
                <div className="h-[56px] w-[56px] bg-neutral-300 rounded-[12px]" />
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-4 w-1/3 bg-neutral-300 rounded" />
                  <div className="h-3 w-2/3 bg-neutral-200 rounded" />
                </div>
              </div>
            ))}
          </>
        )}

        <AnimatePresence>
          {!accountsLoading &&
            availableAccounts?.items.map((accWrapper: any) => {
              const acc = accWrapper.account;
              const handle = acc.username?.localName || acc.handle || acc.metadata?.localName || acc.address.slice(0, 6) + '...';
              const image = resolveImage(acc.metadata?.picture);
              const isAuthenticating = authenticatingAccount === acc.address;

              return (
                <motion.button
                  key={acc.address}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  onClick={() => handleSelect(accWrapper)}
                  disabled={authenticating || isAuthenticating}
                  className={`flex items-center gap-4 p-3 rounded-[24px] w-full cursor-pointer
                    transition-all duration-200
                    ${isAuthenticating ? 'bg-blue-100' : 'bg-neutral-200 hover:bg-neutral-300'}
                    ${authenticating || isAuthenticating ? 'opacity-70 cursor-not-allowed' : ''}
                  `}>
                  <div className="h-[56px] aspect-square overflow-hidden flex-none bg-neutral-300 rounded-[12px]">
                    <img src={image} className="w-full h-full object-cover" alt={`${handle}'s profile picture`} />
                  </div>
                  <div className="flex flex-col items-start gap-1 text-neutral-800">
                    <p className="text-[18px] leading-[24px] font-medium">
                      <span className="text-neutral-500">@</span>
                      {handle}
                    </p>
                    <p className="text-neutral-600 leading-[24px] line-clamp-1 overflow-hidden w-full text-start">{isAuthenticating ? 'Authenticating...' : acc.metadata?.bio || 'Lens Profile'}</p>
                  </div>
                </motion.button>
              );
            })}
        </AnimatePresence>
      </div>

      <button onClick={() => disconnect()} className="text-neutral-600 cursor-pointer text-[14px] leading-[20px] mt-4">
        <span className="text-neutral-500">or</span> change wallet
      </button>
    </>
  );
};

export default Select;
