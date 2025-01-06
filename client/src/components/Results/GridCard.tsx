import { Card } from '../../components/Form/Card';
import colors from '../../styles/colors';
import AGgrid from './AGgrid';
import prettyBytes from 'pretty-bytes';

const cardStyles = `
  small { margin-top: 1rem; opacity: 0.5; }
  a {
    color: ${colors.textColor};
  }
  details {
    // display: inline;
    display: flex;
    transition: all 0.2s ease-in-out;
    h3 {
      display: inline;
    }
    summary {
      padding: 0;
      margin: 1rem 0 0 0;
      cursor: pointer;
    }
    summary:before {
      content: "►";
      position: absolute;
      margin-left: -1rem;
      color: ${colors.primary};
      cursor: pointer;
    }
    &[open] summary:before {
      content: "▼";
    }
  }
`;


const GridCard = (props: { title: string, data: any}): JSX.Element => {

  const calculateObjectsData = (data: any) => {
    let objects_data: any[] = [];

    data.forEach((entry: any) => {
      const objects = entry?.result?.leaks?.objects.map(({ name, retainedSizeDeltaPerIteration, countDeltaPerIteration }) => ({
        type: name,
        addedCount: countDeltaPerIteration,
        retainedSize: prettyBytes(retainedSizeDeltaPerIteration),
      }));
      objects_data = objects_data.concat(objects);
    });

    console.log('Objects_data: ', objects_data);
    return { objects_data };
  };

  const calculateEventListenerData = (data: any) => {
    let event_listener_data: any[] = [];

    data.forEach((entry: any) => {
      const eventListerns = entry?.result?.leaks?.eventListeners.map(({ type, deltaPerIteration, leakingNodes }) => ({
        type,
        addedCount: deltaPerIteration,
        nodes: leakingNodes.map(({ description, nodeCountDeltaPerIteration }) => `${description} (+${nodeCountDeltaPerIteration})`).join(', '),
      }));
      event_listener_data = event_listener_data.concat(eventListerns);
    });

    console.log('eventListerns_data: ', event_listener_data);
    return { event_listener_data };
  };

  const calculateDOMNodesData = (data: any) => {
    let dom_nodes_data: any[] = [];

    data.forEach((entry: any) => {
      const dom_nodes = entry?.result?.leaks?.domNodes.nodes.map(({ description, deltaPerIteration }) => ({
        type: description,
        addedCount: deltaPerIteration,
      }));
      dom_nodes_data = dom_nodes_data.concat(dom_nodes);
    });

    console.log('dom_nodes_data: ', dom_nodes_data);
    return { dom_nodes_data };
  };

  const calculateCollectionsData = (data: any) => {
    let collections_data: any[] = [];

    data.forEach((entry: any) => {
      const collections = entry?.result?.leaks?.collections.map(({ type, deltaPerIteration, preview }) => ({
        type,
        addedCount: deltaPerIteration,
        preview,
      }));
      collections_data = collections_data.concat(collections);
    });

    console.log('collections_data: ', collections_data);
    return { collections_data };
  };

  const { objects_data } = calculateObjectsData(props.data);
  const { event_listener_data } = calculateEventListenerData(props.data);
  const { dom_nodes_data } = calculateDOMNodesData(props.data);
  const { collections_data } = calculateCollectionsData(props.data);

  return (
    <Card heading={props.title} styles={cardStyles}>
      <AGgrid/>
    </Card>
  );
}

export default GridCard;
