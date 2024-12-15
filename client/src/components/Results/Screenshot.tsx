import { useEffect, useState } from 'react';
import { Card } from '../../components/Form/Card';

const cardStyles = `
  overflow: auto;
  max-height: 50rem;
  grid-row: span 2;
  img {
    border-radius: 6px;
    width: 100%;
    margin 0.5rem 0;;
  }
`;

const ScreenshotCard = (props: { url: string, title: string, actionButtons: any }): JSX.Element => {
  // TODO: Minio image handling implementation
  const imageUrl = props.url || "http://localhost:4000/public/screenshots/screenshot.png";
  console.log("Image url:", imageUrl);
  console.log("Title:", props.title);
  return (
    <Card heading={props.title} actionButtons={props.actionButtons} styles={cardStyles}>
      {imageUrl ? (
        <img src={imageUrl} alt="Website screenshot" />
      ) : (
        <p>Loading screenshot...</p>
      )}
    </Card>
  );
};

export default ScreenshotCard;
