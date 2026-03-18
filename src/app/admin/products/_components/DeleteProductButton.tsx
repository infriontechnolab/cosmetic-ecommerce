"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DeleteProductButtonProps {
  productId: number
  productName: string
  deleteAction: () => Promise<void>
}

export function DeleteProductButton({
  productId: _productId,
  productName,
  deleteAction,
}: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto py-0 px-0 text-xs text-chalk-3 hover:text-red-400 hover:bg-transparent"
        >
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface border-border rounded-none max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-chalk">Delete Product</DialogTitle>
          <DialogDescription className="text-chalk-3">
            Delete &quot;{productName}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="border-border text-chalk-2 rounded-none"
          >
            Cancel
          </Button>
          <form
            action={async () => {
              await deleteAction()
              setOpen(false)
            }}
          >
            <Button
              type="submit"
              size="sm"
              className="bg-red-500 text-white hover:bg-red-600 rounded-none"
            >
              Delete
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
