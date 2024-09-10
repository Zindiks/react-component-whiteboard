import React, { useRef, useEffect, useState, useCallback } from "react"
import * as d3 from "d3"
import { Plus, Minus } from "lucide-react"
import { Button } from "./components/ui/button"

const CustomGrid = () => {
  const svgRef = useRef()
  const [transform, setTransform] = useState(d3.zoomIdentity)
  const [components, setComponents] = useState([
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 300, y: 200 },
    { id: 3, x: 400, y: 200 },
  ])
  const [selectedComponents, setSelectedComponents] = useState([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [initialPositions, setInitialPositions] = useState([])

  const zoomBehavior = useRef(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.attr("width", window.innerWidth).attr("height", window.innerHeight)

    zoomBehavior.current = d3.zoom().on("zoom", (event) => {
      if (!isMultiSelectMode) {
        setTransform(event.transform)
      }
    })

    svg.call(zoomBehavior.current)

    const handleKeyDown = (event) => {
      if (event.key === "h") {
        setIsMultiSelectMode((prev) => !prev)
        setSelectedComponents([]) // Reset selection when mode changes
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      svg.selectAll("*").remove()
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMultiSelectMode])

  const handleDragStart = (id) => {
    if (isMultiSelectMode && selectedComponents.includes(id)) {
      const positions = selectedComponents.map((selectedId) => {
        const component = components.find((c) => c.id === selectedId)
        return { id: selectedId, x: component.x, y: component.y }
      })
      setInitialPositions(positions)
    }
  }

  const handleDrag = useCallback(
    (id, deltaX, deltaY) => {
      if (isMultiSelectMode && selectedComponents.includes(id)) {
        setComponents((prevComponents) =>
          prevComponents.map((component) => {
            const initialPos = initialPositions.find(
              (pos) => pos.id === component.id
            )
            if (initialPos) {
              return {
                ...component,
                x: initialPos.x + deltaX,
                y: initialPos.y + deltaY,
              }
            }
            return component
          })
        )
      } else {
        setComponents((prevComponents) =>
          prevComponents.map((component) =>
            component.id === id
              ? {
                  ...component,
                  x: component.x + deltaX,
                  y: component.y + deltaY,
                }
              : component
          )
        )
      }
    },
    [isMultiSelectMode, selectedComponents, initialPositions]
  )

  const handleSelect = useCallback(
    (id) => {
      if (isMultiSelectMode) {
        setSelectedComponents((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
      }
    },
    [isMultiSelectMode]
  )

  const handleZoom = useCallback((factor) => {
    const svg = d3.select(svgRef.current)
    zoomBehavior.current.scaleBy(svg.transition().duration(300), factor)
  }, [])

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <svg ref={svgRef}></svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          pointerEvents: "none",
        }}
      >
        {components.map((component) => (
          <DraggableComponent
            key={component.id}
            x={component.x}
            y={component.y}
            id={component.id}
            onDrag={handleDrag}
            onDragStart={handleDragStart}
            onSelect={handleSelect}
            selected={selectedComponents.includes(component.id)}
            transform={transform}
            isMultiSelectMode={isMultiSelectMode}
          />
        ))}
      </div>
      <ControlPanel onZoom={handleZoom} isMultiSelectMode={isMultiSelectMode} />
      <Shelf />
    </div>
  )
}

const DraggableComponent = ({
  x,
  y,
  id,
  onDrag,
  onDragStart,
  onSelect,
  selected,
  transform,
  isMultiSelectMode,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const [count, setCount] = useState(1)

  const handleMouseDown = (event) => {
    if (isMultiSelectMode && !selected) {
      onSelect(id)
    } else {
      setIsDragging(true)
      const transformedX = x * transform.k + transform.x
      const transformedY = y * transform.k + transform.y
      setDragStart({ x: event.clientX, y: event.clientY })
      setOffset({
        x: event.clientX - transformedX,
        y: event.clientY - transformedY,
      })
      onDragStart(id)
    }
  }

  const handleMouseMove = (event) => {
    if (!isDragging) return

    const deltaX = (event.clientX - dragStart.x) / transform.k
    const deltaY = (event.clientY - dragStart.y) / transform.k

    onDrag(id, deltaX, deltaY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      className={`draggable-component bg-slate-500 rounded-md flex items-center justify-center cursor-move absolute pointer-events-auto ${
        selected ? "border-2 border-blue-500" : ""
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="w-20 bg-slate-800 rounded-md">
        <p className="w-full h-16 justify-center text-white text-7xl">
          {count}
        </p>
        <Button
          className="w-full bg-slate-300"
          onClick={(e) => {
            e.stopPropagation()
            setCount((prev) => prev + 1)
          }}
          variant={"ghost"}
        >
          Click
        </Button>
      </div>
    </div>
  )
}

const ControlPanel = ({ onZoom, isMultiSelectMode }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
      className="flex flex-col p-0"
    >
      <Button onClick={() => onZoom(1.2)} variant={"ghost"} className="p-0 m-0">
        <Plus />
      </Button>
      <Button onClick={() => onZoom(0.8)} variant={"ghost"} className="p-0 m-0">
        <Minus />
      </Button>
      <p className="text-sm mt-2">
        Mode: {isMultiSelectMode ? "Multi-Select" : "Pan"}
      </p>
    </div>
  )
}

const Shelf = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "200px",
        height: "100vh",
        backgroundColor: "#f0f0f0",
        borderLeft: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
      }}
    >
      <div
        draggable
        style={{
          width: "100px",
          height: "100px",
          backgroundColor: "#888",
          marginBottom: "10px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        Drag me
      </div>
    </div>
  )
}

export default CustomGrid
