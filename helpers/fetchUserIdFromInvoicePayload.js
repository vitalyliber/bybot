export default function fetchUserIdFromInvoicePayload(invoice_payload) {
  return invoice_payload.split("userId:")?.[1];
}
