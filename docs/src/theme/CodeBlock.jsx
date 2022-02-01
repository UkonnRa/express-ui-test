/* eslint-disable */
import React from 'react';
import OriginalCodeBlock from '@theme-original/CodeBlock';
import plantumlEncoder from "plantuml-encoder";

export const CodeBlock = (props) => {
  if (props.className?.includes("language-plantuml") === true) {
    const encode = plantumlEncoder.encode(props.children);
    const url = `https://www.plantuml.com/plantuml/svg/${encode}`;
    return <img alt={props.alt} src={url} />;
  } else {
    return <OriginalCodeBlock {...props} />;
  }
};
