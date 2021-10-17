import { CircularBuffer } from "./CircularBuffer";

test('circular buffer works', () => {
  const array = new CircularBuffer(5)

  array.push(1)
  expect(array.length).toBe(1)
  array.push(2)
  expect(array.length).toBe(2)

  expect(array.get(0)).toBe(1)
  expect(array.get(1)).toBe(2)

  expect(() => { array.get(2) }).toThrow()
  expect(() => { array.get(11) }).toThrow()
  expect(() => { array.get(-5) }).toThrow()

  array.push(3)
  array.push(4)
  array.push(5)

  // 1 2 3 4 5
  expect(array.length).toBe(5)
  expect(array.get(0)).toBe(1)

  array.push(6)
  expect(array.get(0)).toBe(2)
  expect(array.length).toBe(5)
  array.push(7)
  array.push(8)
  array.push(9)
  array.push(10)
  expect(array.get(0)).toBe(6)
  expect(array.get(1)).toBe(7)
  expect(array.get(2)).toBe(8)

  var arr = []
  for (const num of array) {
    arr.push(num)
  }

  expect(arr).toStrictEqual([6, 7, 8, 9, 10])
})

test('circular buffer computes average and mean', () => {
  const buffer = new CircularBuffer(5)
  buffer.push(10)
  expect(buffer.sum).toBe(10)
  expect(buffer.mean).toBe(10)

  buffer.push(20)
  expect(buffer.sum).toBe(30)
  expect(buffer.mean).toBe(15)
})

test('circular buffer clears', () => {
  const buffer = new CircularBuffer(5)
  buffer.push(5)
  buffer.push(7)
  expect(buffer.mean).toBe(6)

  buffer.clear()
  expect(buffer.length).toBe(0)
  expect(buffer.mean).toBe(0)

  buffer.push(10)
  expect(buffer.get(0)).toBe(10)
  expect(() => { buffer.get(1) }).toThrow()
})
