import { describe, it, expect } from 'vitest'
// Import thực khi muốn test function cụ thể — test mẫu này verify setup
describe('Project setup', () => {
  it('Vitest chạy được', () => {
    expect(1 + 1).toBe(2)
  })

  it('TypeScript types hoạt động', () => {
    const greeting: string = 'hello'
    expect(greeting.length).toBe(5)
  })

  it('jsdom DOM khả dụng', () => {
    const div = document.createElement('div')
    div.textContent = 'test'
    document.body.appendChild(div)
    expect(div).toHaveTextContent('test')
  })
})
