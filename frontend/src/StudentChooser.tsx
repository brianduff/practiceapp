import { Student } from './types'
import { Avatar } from './Avatar'
import { Size } from './enums'
import './StudentChooser.css'

type Props = {
  students: Student[],
  selectedIndex?: number,
  onSelected: (index: number) => void
}

export function StudentChooser({ students, selectedIndex, onSelected }: Props) {
  var childElements = []

  var index = 0
  for (var child of students) {
    const childNumber = index;
    if (child.logged_in && (selectedIndex === undefined || index === selectedIndex)) {
      childElements.push(
        <button className="stealthy" onClick={() => onSelected(childNumber)}>
          <Avatar
            url={child.picture}
            size={index === selectedIndex ? Size.Large : Size.Medium} />
        </button>)
      if (selectedIndex === undefined) {
        childElements.push(<span>{child.name}</span>)
      }
    }
    index++
  }

  const cls = selectedIndex === undefined ? "StudentChooser" : "StudentChooserSelected";

  return (
    <>
      {selectedIndex === undefined && <h1>Choose a Student</h1>}
      <div className={cls}>
        {childElements}
      </div>
    </>
  )

}