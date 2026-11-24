import { renderText } from "../../utils/helpers";
import { Link } from "./Link";

export const OptionalLink = ({ value, tooltip, name }: { value?: string; tooltip?: boolean, name?: string }) => {
  const text = value?.trim()
  const urlRegex = /^(?:https?:\/\/[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})?|(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\/.*)?$/
  const protocolRegex = /^https?:\/\//i
  const isUrl = urlRegex.test(text)
  const href = isUrl ? protocolRegex.test(text) ? text : `https://${text}` : ''

  return isUrl ? <Link name={name} tooltip={tooltip} label={text} href={href} /> : renderText({text, tooltip, bold: true})
}
