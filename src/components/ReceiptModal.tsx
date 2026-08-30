import Modal from './Modal'
import Receipt from './Receipt'
import type { Order } from '../types'

interface Props {
  order: Order | null
  onClose: () => void
  /** shown as the primary button label; defaults to "New order" */
  primaryLabel?: string
}

export default function ReceiptModal({
  order,
  onClose,
  primaryLabel = 'New order',
}: Props) {
  if (!order) return null

  return (
    <Modal
      open={!!order}
      onClose={onClose}
      title="Receipt"
      size="sm"
      footer={
        <div className="receipt-actions">
          <button className="btn btn-ghost" onClick={() => window.print()}>
            🖨️ Print
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            {primaryLabel}
          </button>
        </div>
      }
    >
      <Receipt order={order} />
    </Modal>
  )
}
