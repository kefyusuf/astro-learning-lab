/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Correlation id assigned by middleware to every request. */
    requestId: string;
  }
}
