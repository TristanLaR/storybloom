"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface ShippingAddressFormProps {
  initialAddress?: Partial<ShippingAddress>;
  onSubmit: (address: ShippingAddress) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export function ShippingAddressForm({
  initialAddress,
  onSubmit,
  onBack,
  isLoading = false,
}: ShippingAddressFormProps) {
  const [address, setAddress] = useState<ShippingAddress>({
    name: initialAddress?.name || "",
    street1: initialAddress?.street1 || "",
    street2: initialAddress?.street2 || "",
    city: initialAddress?.city || "",
    state: initialAddress?.state || "",
    postalCode: initialAddress?.postalCode || "",
    country: initialAddress?.country || "US",
    phone: initialAddress?.phone || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialAddress) {
      setAddress((prev) => ({
        ...prev,
        ...initialAddress,
      }));
    }
  }, [initialAddress]);

  const updateField = useCallback(
    (field: keyof ShippingAddress, value: string) => {
      setAddress((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!address.name.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!address.street1.trim()) {
      newErrors.street1 = "Street address is required";
    }
    if (!address.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!address.state) {
      newErrors.state = "State is required";
    }
    if (!address.postalCode.trim()) {
      newErrors.postalCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(address.postalCode.trim())) {
      newErrors.postalCode = "Please enter a valid ZIP code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [address]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validate()) {
        onSubmit(address);
      }
    },
    [address, validate, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Full Name"
          placeholder="John Smith"
          value={address.name}
          onChange={(e) => updateField("name", e.target.value)}
          error={errors.name}
          disabled={isLoading}
          autoComplete="name"
        />

        <Input
          label="Street Address"
          placeholder="123 Main St"
          value={address.street1}
          onChange={(e) => updateField("street1", e.target.value)}
          error={errors.street1}
          disabled={isLoading}
          autoComplete="address-line1"
        />

        <Input
          label="Apartment, suite, etc. (optional)"
          placeholder="Apt 4B"
          value={address.street2}
          onChange={(e) => updateField("street2", e.target.value)}
          disabled={isLoading}
          autoComplete="address-line2"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="New York"
            value={address.city}
            onChange={(e) => updateField("city", e.target.value)}
            error={errors.city}
            disabled={isLoading}
            autoComplete="address-level2"
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              State
            </label>
            <select
              value={address.state}
              onChange={(e) => updateField("state", e.target.value)}
              disabled={isLoading}
              className={cn(
                "w-full h-10 px-3 rounded-lg border bg-white text-gray-900",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                errors.state ? "border-red-500" : "border-gray-300"
              )}
              autoComplete="address-level1"
            >
              <option value="">Select state</option>
              {US_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1.5 text-sm text-red-500">{errors.state}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="ZIP Code"
            placeholder="10001"
            value={address.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            error={errors.postalCode}
            disabled={isLoading}
            autoComplete="postal-code"
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Country
            </label>
            <select
              value={address.country}
              onChange={(e) => updateField("country", e.target.value)}
              disabled={isLoading}
              className={cn(
                "w-full h-10 px-3 rounded-lg border bg-white text-gray-900",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "border-gray-300"
              )}
              autoComplete="country"
            >
              <option value="US">United States</option>
            </select>
          </div>
        </div>

        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="(555) 123-4567"
          value={address.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          disabled={isLoading}
          autoComplete="tel"
        />
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="flex-1"
        >
          Continue to Shipping
        </Button>
      </div>
    </form>
  );
}
