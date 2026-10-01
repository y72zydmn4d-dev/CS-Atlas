"use client";

import { Component, type ReactNode } from "react";

/** Contains presentation bugs without resetting the editor or exposing authored content/stacks. */
export class PreviewErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
