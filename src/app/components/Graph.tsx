import dynamic from "next/dynamic";
const ForceGraph2D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph2D),
  { ssr: false }
);

export default function MyGraph() {
  const graphData = {
    nodes: [
      { id: "israel", name: "Israel" },
      { id: "hezbollah", name: "Hezbollah" },
      { id: "iran", name: "Irán" },
      { id: "eeuu", name: "Estados Unidos" },
      { id: "libano", name: "Líbano" },
      {
        id: "ataque_hezbollah",
        name: "Ataque a objetivos de Hezbollah en Líbano",
      },
      { id: "ataque_iran", name: "Ataque a bases militares en Irán" },
      { id: "defensa_eeuu", name: "Estados Unidos defiende derecho de Israel" },
      {
        id: "infraestructura_terrorista",
        name: "Desmantelamiento de infraestructura terrorista",
      },
      {
        id: "respuesta_misil",
        name: "Respuesta a lanzamiento de misiles desde Irán",
      },
    ],
    links: [
      { source: "israel", target: "hezbollah" },
      { source: "israel", target: "iran" },
      { source: "israel", target: "libano" },
      { source: "hezbollah", target: "libano" },
      { source: "iran", target: "ataque_iran" },
      { source: "israel", target: "ataque_hezbollah" },
      { source: "israel", target: "ataque_iran" },
      { source: "israel", target: "infraestructura_terrorista" },
      { source: "iran", target: "respuesta_misil" },
      { source: "eeuu", target: "defensa_eeuu" },
      { source: "defensa_eeuu", target: "israel" },
      { source: "ataque_hezbollah", target: "infraestructura_terrorista" },
    ],
  };

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, node.x, node.y - 10);
      }}
      nodeCanvasObjectMode={() => "after"}
      linkDirectionalArrowLength={10} // Increased length for better visibility
      linkDirectionalArrowRelPos={0.5} // Center position along the link
      linkWidth={2} // Width of the links
      linkColor={() => "rgba(255, 255, 255, 0.8)"} // Make the links brighter to be more visible
      linkDirectionalParticles={2} // Optional: Adds moving particles along the links
      linkDirectionalParticleWidth={2} // Optional: Width of the particles to make them visible
    />
  );
}
