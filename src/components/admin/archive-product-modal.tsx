import { Doc } from '@convex/_generated/dataModel'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'
import { IconArchive } from '../icons/archive'
import { useMutation } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@convex/_generated/api'
import { Loader } from '../ui/loader'
import { toast } from 'sonner'

type ArchiveProductModalProps = {
  product: Doc<'products'> | null
  onOpenChange: (isOpen: boolean) => void
}

export const ArchiveProductModal = ({
  product,
  onOpenChange,
}: ArchiveProductModalProps) => {
  const { mutate: archiveProduct, isPending } = useMutation({
    mutationFn: useConvexMutation(api.products.archiveProduct),
    onSuccess: () => {
      onOpenChange(false)
      toast.success('Product archived successfully')
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Modal>
      <Modal.Content
        isOpen={!!product}
        onOpenChange={onOpenChange}
        role="alertdialog"
        isBlurred
      >
        <Modal.Header>
          <Modal.Title>Archive Product</Modal.Title>
          <Modal.Description
            className="text-sm"
            style={{
              lineHeight: 1!,
            }}
          >
            Are you sure you want to archive this product? This will remove it
            from your store and customers will no longer be able to view or
            purchase it. You can restore it later if needed.
          </Modal.Description>
        </Modal.Header>
        <Modal.Footer className="flex-col">
          <Modal.Close isDisabled={isPending}>Cancel</Modal.Close>
          <Button
            intent="danger"
            isDisabled={isPending}
            onPress={() =>
              archiveProduct({
                productId: product?._id!,
              })
            }
          >
            {isPending ? <Loader /> : <IconArchive />}
            {isPending ? 'Archiving...' : 'Archive'}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
}
