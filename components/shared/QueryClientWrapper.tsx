"use client"
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'


const queryClient = new QueryClient()

export default function QueryClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
