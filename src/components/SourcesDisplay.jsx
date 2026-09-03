import React from "react";

import "./SourcesDisplay.css";

export default function SourcesDisplay({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-display">
      <div className="sources-display-header">
        <h3>Fuente</h3>
      </div>

      <div className="sources-display-list">
        {sources.map((source) => {
          const content = source.url || "";

          // Detectamos si es un código embed (contiene etiquetas HTML)

          const isEmbed = content.includes("<") && content.includes(">");

          if (isEmbed) {
            return (
              <div
                key={source.id}
                className="source-embed-wrapper"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            );
          } else {
            // Si es solo un enlace web normal

            const validUrl = content.startsWith("http")
              ? content
              : `https://${content}`;

            return (
              <div key={source.id} className="source-link-wrapper">
                <a href={validUrl} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
