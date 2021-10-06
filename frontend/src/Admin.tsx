import { ButtonBar, button } from './ButtonBar'
import { useHistory } from 'react-router-dom';

export function Admin() {
  const history = useHistory()

  return (
    <ButtonBar buttons={[
      button("Add Student", () => { history.push("/admin/addstudent") }),
      button("Leaderboard", () => { history.push("/") })
    ]} />
  )
}