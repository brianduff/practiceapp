import './Avatar.css'

type Props = {
  url: string
}

export default function Avatar({ url }: Props) {
  return (
    <img src={url} alt="Avatar" className="Avatar" />
  )
}