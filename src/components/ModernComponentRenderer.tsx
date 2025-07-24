/**
 * Modern Component Renderer using Widget Registry
 *
 * React component that uses the widget registry to render components
 */

import React from "react";
import { useWidgetCreator, WidgetProps } from "../stores/widgetRegistryStore";

export interface ModernComponentRendererProps extends WidgetProps {
  enableErrorBoundary?: boolean;
}

export const ModernComponentRenderer: React.FC<
  ModernComponentRendererProps
> = ({ enableErrorBoundary = true, ...props }) => {
  const { create, createWithErrorBoundary } = useWidgetCreator();
  const { component } = props;

  if (enableErrorBoundary) {
    return createWithErrorBoundary(component.type, props);
  }

  const widget = create(component.type, props);

  if (!widget) {
    return (
      <div className="w-20 bg-slate-800 rounded-md p-2">
        <p className="text-white text-center">Unknown: {component.type}</p>
      </div>
    );
  }

  return widget;
};
