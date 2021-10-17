// A circular array is a view on to a fixed size array. Pushing
// onto the array continues until the array is full, and then
// wraps back to the start.
export class CircularBuffer implements Iterable<number> {
  array: Float64Array
  head: number = 0 // invariant: head is always where the list starts
  tail: number = 0 // invariant: tail is always the next position we'll insert at
  size: number = 0

  constructor(maxSize: number) {
    this.array = new Float64Array(maxSize)
  }

  push(value: number) {
    this.array[this.tail] = value

    if (this.size === this.array.length) {
      this.head = (this.head + 1) % this.array.length
    }
    this.tail = (this.tail + 1) % this.array.length

    if (this.size < this.array.length) {
      this.size++
    }
  }

  get sum() {
    // We could keep track of this as items are added to avoid having to recalculate.
    var sum = 0
    for (const v of this) {
      sum += v
    }
    return sum
  }

  get mean() {
    if (this.length === 0) {
      return 0
    }
    return this.sum / this.length
  }

  get length() {
    return this.size
  }

  get(index: number): number {
    if (index < 0 || index > this.size - 1) {
      throw new Error("Out of bounds")
    }

    let realIndex = (this.head + index) % this.array.length
    return this.array[realIndex]
  }

  [Symbol.iterator](): Iterator<number> {
    return new CircularBufferIterator(this)
  }

  clear() {
    this.head = 0
    this.tail = 0
    this.size = 0
  }
}

class CircularBufferIterator implements Iterator<number> {
  circularBuffer: CircularBuffer
  pos: number = 0

  constructor(circularBuffer: CircularBuffer) {
    this.circularBuffer = circularBuffer
  }

  next(_?: any): IteratorResult<number> {
    var done = this.pos === this.circularBuffer.length

    if (done) {
      return {
        done,
        value: this.pos
      }
    }

    var value = this.circularBuffer.get(this.pos)
    this.pos++

    return {
      done,
      value
    }
  }
}