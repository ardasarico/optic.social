'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { lens, lensTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';

const config = createConfig(
  getDefaultConfig({
    chains: [lens, lensTestnet],

    // @ts-ignore
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    appName: 'optic.social',

    appDescription: 'add description later',
    appUrl: 'https://optic.social',
    appIcon: 'https://optic.social/logo.svg',
  })
);

const queryClient = new QueryClient();

// @ts-ignore
export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
