"use client";

import { useState, useCallback, FormEvent } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  description: string;
  onSuccess: () => void;
  onCancel?: () => void;
  returnUrl?: string;
}

export function PaymentForm({
  clientSecret,
  amount,
  description,
  onSuccess,
  onCancel,
  returnUrl,
}: PaymentFormProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#7c3aed",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        amount={amount}
        description={description}
        onSuccess={onSuccess}
        onCancel={onCancel}
        returnUrl={returnUrl}
      />
    </Elements>
  );
}

interface CheckoutFormProps {
  amount: number;
  description: string;
  onSuccess: () => void;
  onCancel?: () => void;
  returnUrl?: string;
}

function CheckoutForm({
  amount,
  description,
  onSuccess,
  onCancel,
  returnUrl,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setIsProcessing(true);
      setError(null);

      const { error: submitError } = await elements.submit();

      if (submitError) {
        setError(submitError.message || "An error occurred");
        setIsProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl || window.location.origin + "/payment-success",
          },
          redirect: "if_required",
        });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        setSucceeded(true);
        onSuccess();
      }

      setIsProcessing(false);
    },
    [stripe, elements, returnUrl, onSuccess]
  );

  // Format amount for display
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600">
          Your payment of {formattedAmount} has been processed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{description}</span>
          <span className="font-semibold text-gray-900">{formattedAmount}</span>
        </div>
      </div>

      {/* Payment Element */}
      <div className="border rounded-lg p-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="font-medium text-red-800">Payment Failed</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          isLoading={isProcessing}
          className={cn("flex-1", !onCancel && "w-full")}
        >
          {isProcessing ? "Processing..." : `Pay ${formattedAmount}`}
        </Button>
      </div>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>Secured by Stripe</span>
      </div>
    </form>
  );
}

// Wrapper component for when clientSecret is being fetched
interface PaymentFormWrapperProps {
  isLoading?: boolean;
  error?: string | null;
  clientSecret?: string | null;
  amount: number;
  description: string;
  onSuccess: () => void;
  onCancel?: () => void;
  returnUrl?: string;
}

export function PaymentFormWrapper({
  isLoading,
  error,
  clientSecret,
  amount,
  description,
  onSuccess,
  onCancel,
  returnUrl,
}: PaymentFormWrapperProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4" />
        <p className="text-gray-500">Setting up payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <svg
          className="w-12 h-12 text-red-400 mx-auto mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="font-medium text-red-800 mb-1">Payment Setup Failed</h3>
        <p className="text-sm text-red-600">{error}</p>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="mt-4">
            Go Back
          </Button>
        )}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-12 text-gray-500">
        No payment required
      </div>
    );
  }

  return (
    <PaymentForm
      clientSecret={clientSecret}
      amount={amount}
      description={description}
      onSuccess={onSuccess}
      onCancel={onCancel}
      returnUrl={returnUrl}
    />
  );
}
