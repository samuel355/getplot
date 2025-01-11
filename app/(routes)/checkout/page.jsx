'use client'
import CartItem from "@/app/_components/CartItem";
import Header from "@/app/_components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/store/useStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const Checkout = () => {
  const { plots, getTotal } = useCart();
  const total = getTotal();
  const router = useRouter()

  return (
    <>
      <Header />
      <div className="py-8 mt-3 w-full px-12 lg:px-14">
        <div className="mb-8">
          <nav className="flex text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Cart</span>
          </nav>
        </div>

        {plots.length > 0 ? (
          <>
            <h1 className="text-4xl font-bold mb-8">YOUR CART</h1>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="space-y-4 max-h-[48rem] overflow-y-scroll">
                  {plots.map((plot) => (
                    <CartItem
                      plot={plot}
                    />
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Order Summary
                    </h2>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Quantity</span>
                        <span> {plots.length}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>GHS {total.toLocaleString()}</span>
                      </div>
                      <Button onClick={() => router.push('/buy-plot')} className="w-full" size="lg">
                        Proceed to Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <h4 className="p-3 border rounded">
              Your cart is empty.
              <Link href={"/"}> Visit our sites to add plots</Link>
              to cart
            </h4>
          </div>
        )}
      </div>
    </>
  );
};

export default Checkout;
