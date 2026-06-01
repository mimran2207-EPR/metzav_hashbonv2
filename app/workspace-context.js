// workspace-context.js — shares the account-level values that were previously drilled
// through several component layers (year switching + holder navigation). Consumers read
// them via useWorkspaceCtx() instead of receiving (and forwarding) props.
import { createContext, useContext } from 'react';

/**
 * @typedef {Object} WorkspaceCtx
 * @property {number} year
 * @property {(y: number) => void} setYear
 * @property {(h: import('./types.js').Holder, entity?: import('./types.js').EntityRow, propBalance?: number) => void} openHolder
 * @property {string} activePayerNo
 */

/** @type {import('react').Context<WorkspaceCtx|null>} */
export const WorkspaceContext = createContext(null);

/** @returns {WorkspaceCtx} */
export const useWorkspaceCtx = () => useContext(WorkspaceContext);
