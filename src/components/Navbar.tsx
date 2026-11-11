import { Link } from "react-router-dom"
import { Package, ShoppingCart } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { useCartData } from "@/context/CartContext"
import { useOrderData } from "@/context/OrderContext"

export function Navbar() {
  const {getCartItems, cartLength} = useCartData()
  const {getOrders} = useOrderData()
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-2xl font-bold text-primary">
          Shopify
        </Link>

        <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Shopping cart"
              onClick={() => getCartItems()}
              render={<Link to="/cart"/>}
            >
              <ShoppingCart className="size-5" />

              <Badge className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-xs">
                {cartLength}
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="My orders"
              onClick={() => getOrders()}
              render={<Link to="/orders"/>}
            >
              <Package className="size-5" />
            </Button>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<Link to="/login" />}
                  className="rounded-full"
                >
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>KP</AvatarFallback>
                  </Avatar>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  )
}