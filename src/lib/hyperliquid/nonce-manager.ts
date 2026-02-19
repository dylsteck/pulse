export class NonceManager {
  private last = Date.now()

  next(): number {
    const now = Date.now()
    this.last = now > this.last ? now : this.last + 1
    return this.last
  }
}
