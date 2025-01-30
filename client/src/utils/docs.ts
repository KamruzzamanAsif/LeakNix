export interface Doc {
  id: string;
  title: string;
  description: string;
  use: string;
  resources: string[] | { title: string, link: string}[];
  screenshot?: string;
}


const docs: Doc[] = [
  // {
  //   id: "get-ip",
  //   title: "IP Info",
  //   description:
  //     "An IP address (Internet Protocol address) is a numerical label assigned to each device connected to a network / the internet. The IP associated with a given domain can be found by querying the Domain Name System (DNS) for the domain's A (address) record.",
  //   use: "Finding the IP of a given server is the first step to conducting further investigations, as it allows us to probe the server for additional info. Including creating a detailed map of a target's network infrastructure, pinpointing the physical location of a server, identifying the hosting service, and even discovering other domains that are hosted on the same IP address.",
  //   resources: [
  //     { title: 'Understanding IP Addresses', link: 'https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking'},
  //     { title: 'IP Addresses - Wiki', link: 'https://en.wikipedia.org/wiki/IP_address'},
  //     { title: 'RFC-791 Internet Protocol', link: 'https://tools.ietf.org/html/rfc791'},
  //     { title: 'whatismyipaddress.com', link: 'https://whatismyipaddress.com/'},
  //   ],
  // },
  // {
  //   id: "location",
  //   title: "Server Location",
  //   description:
  //     "The Server Location task determines the physical location of the server hosting a given website based on its IP address. This is done by looking up the IP in a location database, which maps the IP to a lat + long of known data centers and ISPs. From the latitude and longitude, it's then possible to show additional contextual info, like a pin on the map, along with address, flag, time zone, currency, etc.",
  //   use: "Knowing the server location is a good first step in better understanding a website. For site owners this aids in optimizing content delivery, ensuring compliance with data residency requirements, and identifying potential latency issues that may impact user experience in specific geographical regions. And for security researcher, assess the risk posed by specific regions or jurisdictions regarding cyber threats and regulations.",
  //   resources: [
  //     { title: 'IP Locator', link: 'https://geobytes.com/iplocator/' },
  //     { title: 'Internet Geolocation - Wiki', link: 'https://en.wikipedia.org/wiki/Internet_geolocation' },
  //   ],
  //   screenshot: 'https://i.ibb.co/cXH2hfR/wc-location.png',
  // },
  {
    id: "event-listener-leak",
    title: "Event Listener Leak Detection",
    description:
      "Detects memory leaks caused by event listeners that are not properly removed or detached from DOM elements, leading to memory bloat.",
    use: "This feature helps to ensure that event listeners are correctly cleaned up to prevent memory issues in Single Page Applications (SPAs). It improves performance by avoiding unnecessary retention of memory.",
    resources: [
      { title: 'JavaScript Memory Leaks', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' },
      { title: 'Event Listener Best Practices', link: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener' }
    ]
  },
  {
    id: "collection-leak",
    title: "Collections (Arrays, Maps, Sets, ..) Leak Detection",
    description:
      "Monitors memory consumption for JavaScript collections (arrays, maps, sets, etc.), identifying potential leaks caused by overgrown or unemptied data structures.",
    use: "Helps developers manage collections that continue to grow without being cleared, reducing unnecessary memory usage and improving application efficiency.",
    resources: [
      { title: 'Managing Memory with Arrays and Collections', link: 'https://javascript.info/weakmap-weakset' },
      { title: 'Preventing Memory Leaks in JavaScript', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' }
    ]
  },
  {
    id: "dom-nodes-leak",
    title: "DOM Nodes Leak Detection",
    description:
      "Detects memory leaks caused by DOM elements that are retained in memory after being removed from the DOM, preventing garbage collection.",
    use: "Helps identify unused or redundant DOM nodes that consume memory unnecessarily, enhancing overall application performance.",
    resources: [
      { title: 'DOM Nodes and Memory Management', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' },
      { title: 'Avoiding Memory Leaks', link: 'https://developers.google.com/web/tools/chrome-devtools/memory-problems' }
    ]
  },
  {
    id: "detached-dom-nodes-leak",
    title: "Detached DOM Nodes Leak Detection",
    description:
      "Identifies DOM nodes that are detached from the document tree but still referenced in memory, leading to memory leaks.",
    use: "Allows developers to pinpoint and eliminate detached DOM nodes, preventing memory issues that can degrade application performance over time.",
    resources: [
      { title: 'Memory Leaks in JavaScript', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' },
      { title: 'Understanding DOM Detachment', link: 'https://developers.google.com/web/tools/chrome-devtools/memory-problems' }
    ]
  },
  {
    id: "object-leak",
    title: "Objects Leak Detection",
    description:
      "Detects leaks caused by objects that remain in memory even after they are no longer needed or referenced in the code.",
    use: "Improves application memory management by ensuring that objects are properly cleaned up after use, preventing memory overhead.",
    resources: [
      { title: 'Object Leaks in JavaScript', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' },
      { title: 'Memory Profiling with DevTools', link: 'https://developers.google.com/web/tools/chrome-devtools/memory-problems' }
    ]
  },
  {
    id: "plain-object-leak",
    title: "Plain Objects Leak Detection",
    description:
      "Identifies memory leaks caused by plain objects in JavaScript that continue to occupy memory after they are no longer necessary.",
    use: "This feature helps developers maintain efficient memory usage by tracking plain object retention and ensuring proper cleanup.",
    resources: [
      { title: 'Memory Management and Objects', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' },
      { title: 'JavaScript Object Memory Leaks', link: 'https://developers.google.com/web/tools/chrome-devtools/memory-problems' }
    ]
  },
  {
    id: "component-level-leak",
    title: "Component-Level Leak Identification",
    description:
      "Analyzes memory leaks specifically at the component level in frameworks like React, Vue, and Angular, helping identify components that retain excess memory.",
    use: "Optimizes component lifecycle and memory usage, making SPAs more performant by addressing component-specific memory issues.",
    resources: [
      { title: 'React Performance Optimization', link: 'https://reactjs.org/docs/optimizing-performance.html' },
      { title: 'Vue Memory Management', link: 'https://v3.vuejs.org/guide/migration/migration-memory-management.html' }
    ]
  },
  {
    id: "iterative-memory-growth",
    title: "Iterative Memory Growth Detection",
    description:
      "Monitors applications over time to detect slow and steady memory growth, indicating a potential leak that worsens with prolonged usage.",
    use: "Provides insights into memory growth patterns, helping developers tackle leaks that only manifest after extended usage.",
    resources: [
      { title: 'Understanding Memory Growth', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' },
      { title: 'Performance Profiling with DevTools', link: 'https://developers.google.com/web/tools/chrome-devtools/memory-problems' }
    ]
  },
  {
    id: "heap-snapshot",
    title: "Heap Snapshot Analysis",
    description:
      "Generates heap snapshots that provide detailed memory usage insights, allowing developers to analyze memory allocation and identify potential leaks.",
    use: "Helps in diagnosing memory issues by providing a clear picture of how memory is allocated and used in the application.",
    resources: [
      { title: 'Heap Snapshot Analysis', link: 'https://developers.google.com/web/tools/chrome-devtools/memory-problems' },
      { title: 'Profiling JavaScript Memory', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' }
    ]
  },
  {
    id: "interactive-visualization",
    title: "Leak Visualization",
    description:
      "Provides a dynamic, graphical interface that visualizes memory leaks and shows how different parts of the application are consuming memory.",
    use: "Aids developers in understanding complex memory usage patterns through interactive graphs and visual cues, facilitating faster debugging.",
    resources: [
      { title: 'Memory Profiling Tools', link: 'https://developers.google.com/web/tools/chrome-devtools/memory-problems' },
      { title: 'JavaScript Memory Management', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' }
    ]
  },
  {
    id: "progressive-consumption",
    title: "Progressive Memory Consumption Analysis",
    description:
      "Tracks and analyzes memory consumption progressively during application usage, identifying any memory leaks that grow over time.",
    use: "Helps in diagnosing issues in long-running SPAs by detecting subtle memory leaks that worsen gradually.",
    resources: [
      { title: 'Memory Consumption Profiling', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' },
      { title: 'JavaScript Memory Leaks', link: 'https://developers.google.com/web/tools/chrome-devtools/memory-problems' }
    ]
  },
  {
    id: "performance-degradation",
    title: "Performance Degradation Alerts",
    description:
      "Generates alerts when memory usage crosses critical thresholds, helping to prevent performance degradation caused by memory leaks.",
    use: "Keeps the application performant by notifying developers when memory leaks begin to impact performance.",
    resources: [
      { title: 'JavaScript Memory Management', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' },
      { title: 'Profiling Performance in SPAs', link: 'https://developers.google.com/web/tools/chrome-devtools/memory-problems' }
    ]
  },
  {
    id: "detailed-report-export",
    title: "Detailed Leak Reporting and Export",
    description:
      "Generates comprehensive reports on memory leaks, detailing where and how the leaks occurred, and allows exporting of this data for further analysis.",
    use: "Enables developers and testers to share detailed memory analysis reports, making it easier to resolve issues collaboratively.",
    resources: [
      { title: 'Memory Leak Reporting', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management' },
      { title: 'Exporting Memory Reports', link: 'https://developers.google.com/web/tools/chrome-devtools/memory-problems' }
    ]
  },
]


export const featureIntro = [
  'feature-summary'
];

export const about = [
`about`,
];

export const license = `license
`;

export const supportUs = [
  "support"
];

export const fairUse = [
  'Please use this tool responsibly.'
];


export default docs;