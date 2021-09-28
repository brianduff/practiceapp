type Props = {
  seconds: number
}

export default function Time({ seconds }: Props) {
  const minutes = Math.floor(seconds / 60);
  const secondsInMinute = seconds % 60;

  var displayedSeconds = "" + secondsInMinute;

  if (secondsInMinute < 10) {
    displayedSeconds = "0" + displayedSeconds;
  }

  return (
    <div>{minutes}:{displayedSeconds}</div>
  );
}