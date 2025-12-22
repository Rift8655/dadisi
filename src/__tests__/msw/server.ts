import { setupServer } from "msw/node"
import { handlers } from "./handlers"

// Export a test server that test suites can import and start/stop as needed
export const server = setupServer(...handlers)

export default server
