import React, { useRef, useEffect, useState, useCallback } from "react"
import * as d3 from "d3"
import { Plus, Minus } from "lucide-react"
import { Button } from "./components/ui/button"
import { Popover } from "./components/ui/popover"
import { DialogDemo } from "./Dialog"

const CustomGrid = () => {
  const svgRef = useRef()
  const [transform, setTransform] = useState(d3.zoomIdentity)
  const [components, setComponents] = useState([
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 300, y: 200 },
    { id: 3, x: 3000, y: 2000 },
  ])
  const zoomBehavior = useRef(null)

  useEffect(() => {
    console.log(components)
  }, [components])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.attr("width", window.innerWidth).attr("height", window.innerHeight)

    zoomBehavior.current = d3.zoom().on("zoom", (event) => {
      setTransform(event.transform)
    })

    svg.call(zoomBehavior.current)

    console.log(svg)

    return () => svg.selectAll("*").remove()
  }, [])

  useEffect(() => {
    const svg = d3.select(svgRef.current)

    const drag = d3.drag().on("drag", function (event, d) {
      const newX = (event.x - transform.x) / transform.k
      const newY = (event.y - transform.y) / transform.k

      setComponents((prevComponents) =>
        prevComponents.map((component) =>
          component.id === d.id ? { ...component, x: newX, y: newY } : component
        )
      )
    })

    svg.selectAll(".draggable-component").call(drag)

    return () => svg.selectAll(".draggable-component").on(".drag", null)
  }, [transform])

  const handleZoom = useCallback((factor) => {
    const svg = d3.select(svgRef.current)
    zoomBehavior.current.scaleBy(svg.transition().duration(300), factor)
  }, [])

  // const handlePan = useCallback((dx, dy) => {
  //   const svg = d3.select(svgRef.current)
  //   zoomBehavior.current.translateBy(svg.transition().duration(300), dx, dy)
  // }, [])

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <svg ref={svgRef}></svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
        }}
      >
        {components.map((component) => (
          <DraggableComponent
            key={component.id}
            x={component.x}
            y={component.y}
            id={component.id}
          />
        ))}
      </div>
      <ControlPanel onZoom={handleZoom} />
    </div>
  )
}

const DraggableComponent = ({ x, y, id }) => {
  const [count, setCount] = useState(1)

  return (
    <div
      draggable
      className="draggable-component"
      style={{
        backgroundColor: "lightblue",
        transform: `translate(${x}px, ${y}px)`,
        cursor: "move",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
      }}
    >
      Component {id}
      [X:{Math.round(x)}] [Y:{Math.round(y)}]<h1>{count}</h1>
      <Button
        onClick={() => {
          setCount((prev) => prev + 1)
        }}
        variant={"ghost"}
      >
        Click
      </Button>
      <DialogDemo data={{ x, y, id }} />
    </div>
  )
}

const ControlPanel = ({ onZoom }) => {
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
      className="flex flex-col"
    >
      <Button onClick={() => onZoom(1.2)} variant={"ghost"}>
        <Plus />
      </Button>
      <Button onClick={() => onZoom(0.8)} variant={"ghost"}>
        <Minus />
      </Button>
      {/* <button onClick={() => onPan(50, 0)}>Pan Right</button>
      <button onClick={() => onPan(-50, 0)}>Pan Left</button>
      <button onClick={() => onPan(0, 50)}>Pan Down</button>
      <button onClick={() => onPan(0, -50)}>Pan Up</button> */}
    </div>
  )
}

export default CustomGrid
