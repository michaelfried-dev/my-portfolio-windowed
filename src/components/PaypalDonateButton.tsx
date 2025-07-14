"use client"

import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { FaPaypal } from "react-icons/fa"

export default function PaypalDonateButton() {
  return (
    <Button
      asChild
      variant="neutral"
      className="flex w-full items-center justify-center gap-2"
    >
      <a
        href="https://www.paypal.com/donate/?hosted_button_id=GQHH6WPUAHWZW"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaPaypal className="size-5" />
        <span>Donate</span>
      </a>
    </Button>

    //comment
  )
}

