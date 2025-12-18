import { server } from "./server"
import "@testing-library/jest-dom/vitest"
import { beforeAll, afterEach, afterAll } from "vitest"


// Start MSW before all tests and clean up after
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
