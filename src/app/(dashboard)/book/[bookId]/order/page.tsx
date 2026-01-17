"use client";

import { use, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ShippingAddressForm,
  ShippingMethodSelector,
  OrderSummary,
  type ShippingAddress,
  type ShippingOption,
} from "@/components/order";
import { PaymentFormWrapper } from "@/components/payment/PaymentForm";
import { cn } from "@/lib/utils";

// Mock book data for development
const mockBook = {
  _id: "book-1",
  title: "The Great Adventure",
  authorName: "Jane Smith",
  status: "finalized" as const,
  coverImageUrl: null,
  pageCount: 24,
};

// Order flow steps
type OrderStep = "address" | "shipping" | "review" | "payment" | "confirmation";

const STEPS: { key: OrderStep; label: string }[] = [
  { key: "address", label: "Address" },
  { key: "shipping", label: "Shipping" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
];

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: typeof STEPS;
  currentStep: OrderStep;
}) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                index < currentIndex
                  ? "bg-primary-500 text-white"
                  : index === currentIndex
                  ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {index < currentIndex ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "text-sm hidden sm:block",
                index <= currentIndex ? "text-gray-900 font-medium" : "text-gray-500"
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-12 h-0.5 mx-2",
                index < currentIndex ? "bg-primary-500" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderConfirmation({
  orderId,
  bookTitle,
}: {
  orderId: string;
  bookTitle: string;
}) {
  const router = useRouter();

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-green-500"
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
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Order Confirmed!
      </h2>
      <p className="text-gray-600 mb-6">
        Thank you for your order. Your book "{bookTitle}" is being prepared for
        printing.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-sm mx-auto">
        <p className="text-sm text-gray-500 mb-1">Order Number</p>
        <p className="text-lg font-mono font-medium text-gray-900">{orderId}</p>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-8">
        <p>A confirmation email has been sent to your email address.</p>
        <p>You can track your order status from your dashboard.</p>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
        <Button onClick={() => router.push(`/book/${orderId}/track`)}>
          Track Order
        </Button>
      </div>
    </div>
  );
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = use(params);
  const router = useRouter();

  // In real implementation, fetch from Convex:
  // const book = useQuery(api.books.getBook, { bookId });
  const book = mockBook;

  const [step, setStep] = useState<OrderStep>("address");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate costs
  const printCost = 999 * quantity; // $9.99 per book (mock)
  const selectedShipping = shippingOptions.find(
    (o) => o.level === selectedShippingMethod
  );
  const shippingCost = selectedShipping?.cost || 0;
  const taxAmount = 0; // Would be calculated based on address
  const totalAmount = printCost + shippingCost + taxAmount;

  // Fetch shipping options when address is submitted
  const handleAddressSubmit = useCallback(async (address: ShippingAddress) => {
    setShippingAddress(address);
    setIsLoadingShipping(true);
    setError(null);

    try {
      // In real implementation, call Convex action:
      // const options = await calculateShippingOptions({ address, quantity, pageCount: book.pageCount });

      // Mock shipping options
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockOptions: ShippingOption[] = [
        {
          level: "MAIL",
          name: "Standard Mail",
          cost: 499,
          currency: "USD",
          estimatedDelivery: {
            minimum: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            maximum: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        {
          level: "GROUND_HD",
          name: "Ground Home Delivery",
          cost: 799,
          currency: "USD",
          estimatedDelivery: {
            minimum: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            maximum: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        {
          level: "EXPRESS",
          name: "Express",
          cost: 1499,
          currency: "USD",
          estimatedDelivery: {
            minimum: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            maximum: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      ];

      setShippingOptions(mockOptions);
      setStep("shipping");
    } catch (err) {
      setError("Failed to calculate shipping options. Please try again.");
      console.error(err);
    } finally {
      setIsLoadingShipping(false);
    }
  }, []);

  const handleShippingSelect = useCallback((method: string) => {
    setSelectedShippingMethod(method);
  }, []);

  const handleProceedToReview = useCallback(() => {
    if (selectedShippingMethod) {
      setStep("review");
    }
  }, [selectedShippingMethod]);

  const handleProceedToPayment = useCallback(async () => {
    if (!shippingAddress || !selectedShippingMethod) return;

    setIsCreatingOrder(true);
    setError(null);

    try {
      // In real implementation:
      // 1. Create order in Convex
      // const order = await createOrder({ bookId, userId, quantity, shippingAddress, ... });
      // 2. Create payment intent
      // const { clientSecret } = await createPrintOrderPaymentIntent({ orderId: order._id, amount: totalAmount });

      // Mock order creation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockOrderId = `order-${Date.now()}`;
      const mockClientSecret = "pi_mock_client_secret";

      setOrderId(mockOrderId);
      setClientSecret(mockClientSecret);
      setStep("payment");
    } catch (err) {
      setError("Failed to create order. Please try again.");
      console.error(err);
    } finally {
      setIsCreatingOrder(false);
    }
  }, [shippingAddress, selectedShippingMethod, totalAmount]);

  const handlePaymentSuccess = useCallback(() => {
    setStep("confirmation");
  }, []);

  const handleBack = useCallback(() => {
    switch (step) {
      case "shipping":
        setStep("address");
        break;
      case "review":
        setStep("shipping");
        break;
      case "payment":
        setStep("review");
        break;
    }
  }, [step]);

  // Check if book is finalized
  if (book.status !== "finalized") {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-yellow-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Book Not Ready for Ordering
          </h2>
          <p className="text-gray-600 mb-6">
            Please finalize your book before placing an order.
          </p>
          <Button onClick={() => router.push(`/book/${bookId}`)}>
            Return to Editor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Your Book</h1>
        <p className="text-gray-600 mt-2">
          Get a beautiful printed copy of "{book.title}" delivered to your door
        </p>
      </div>

      {/* Step Indicator */}
      {step !== "confirmation" && (
        <StepIndicator steps={STEPS} currentStep={step} />
      )}

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
              <h4 className="font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {step === "address" && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <ShippingAddressForm
              initialAddress={shippingAddress || undefined}
              onSubmit={handleAddressSubmit}
              isLoading={isLoadingShipping}
            />
          </>
        )}

        {step === "shipping" && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select Shipping Method
            </h2>
            <ShippingMethodSelector
              options={shippingOptions}
              selectedMethod={selectedShippingMethod}
              onSelect={handleShippingSelect}
              onContinue={handleProceedToReview}
              onBack={handleBack}
              isLoading={isLoadingShipping}
            />
          </>
        )}

        {step === "review" && shippingAddress && selectedShippingMethod && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Review Your Order
            </h2>
            <OrderSummary
              bookTitle={book.title}
              coverImageUrl={book.coverImageUrl}
              quantity={quantity}
              printCost={printCost}
              shippingCost={shippingCost}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
              shippingAddress={shippingAddress}
              shippingMethod={
                shippingOptions.find((o) => o.level === selectedShippingMethod)
                  ?.name || selectedShippingMethod
              }
              onProceedToPayment={handleProceedToPayment}
              onBack={handleBack}
              onChangeQuantity={setQuantity}
              isLoading={isCreatingOrder}
            />
          </>
        )}

        {step === "payment" && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment
            </h2>
            <PaymentFormWrapper
              isLoading={!clientSecret}
              clientSecret={clientSecret}
              amount={totalAmount}
              description={`Order: ${book.title} (${quantity} copy)`}
              onSuccess={handlePaymentSuccess}
              onCancel={handleBack}
            />
          </>
        )}

        {step === "confirmation" && orderId && (
          <OrderConfirmation orderId={orderId} bookTitle={book.title} />
        )}
      </div>

      {/* Help Text */}
      {step !== "confirmation" && (
        <div className="text-center text-sm text-gray-500">
          <p>
            Questions? Contact us at{" "}
            <a
              href="mailto:support@storybloom.com"
              className="text-primary-600 hover:underline"
            >
              support@storybloom.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
