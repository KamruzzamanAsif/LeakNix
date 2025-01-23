const CONSTANTS = {
    ACCESSIBILITY: {
        PUBLIC: 'public',
        PRIVATE: 'private'
    },
    ALLOWED_REACT_COMPONENT_ENCAPSULATORS: ['React.memo', 'memo', 'React.forwardRef', 'forwardRef'],
    ANGULAR_CLASS_DECORATORS: ['Component', 'Directive', 'Pipe', 'Injectable'],
    ANGULAR_LOWERCASE: 'angular',
    ANGULAR_MODULE: 'module',
    COLLECTION_METHOD_NAMES: {
        PUSH: 'push',
        ADD: 'add'
    },
    CONTAINER_TYPES: {
        CLASS: 0,
        REACT_COMPONENT: 1,
        REACT_FUNCTIONAL_COMPONENT: 2,
        REACT_CLASS_COMPONENT: 3,
        ANGULAR_CLASS: 4
    },
    EVENTS_LIST_NAME: 'eventListenersToRemove',
    FRAMEWORKS: {
        ANGULAR: 'Angular',
        REACT: 'React'
    },
    IMPORT_SOURCES: {
        REACT: 'react',
        ANGULAR_CORE: '@angular/core',
        RXJS: 'rxjs',
        FROM_RXJS: 'rxjs/'
    },
    IMPORT_KINDS: {
        VALUE: 'value'
    },
    IMPORTED_SPECIFIERS: {
        ON_DESTROY_HOOK: 'OnDestroy',
        SUBSCRIPTION: 'Subscription',
        IS_OBSERVABLE: 'isObservable',
        TAKE_UNTIL: 'takeUntil',
        USE_EFFECT_HOOK: 'useEffect',
        USE_REF_HOOK: 'useRef'
    },
    JAVASCRIPT: 'js' || 'jsx',
    METHOD_NAMES: {
        ADD_EVENT_LISTENER: 'addEventListener',
        CANCEL_ANIMATION_FRAME: 'cancelAnimationFrame',
        CLEAR_TIMEOUT: ['window.clearTimeout', 'clearTimeout'],
        CLEAR_INTERVAL: ['window.clearInterval', 'clearInterval'],
        COMPONENT_DID_MOUNT: 'componentDidMount',
        COMPONENT_WILL_UNMOUNT: 'componentWillUnmount',
        NG_ON_DESTROY: 'ngOnDestroy',
        PIPE: 'pipe',
        REMOVE_EVENT_LISTENER: 'removeEventListener',
        REQUEST_ANIMATION_FRAME: 'requestAnimationFrame',
        SET_TIMEOUT: ['setTimeout', 'window.setTimeout'],
        SET_INTERVAL: ['setInterval', 'window.setInterval'],
        SUBSCRIBE: 'subscribe',
        TAKE_UNTIL: 'takeUntil',
        UNSUBSCRIBE: 'unsubscribe'
    },
    NODE_KINDS: {
        CONSTRUCTOR: 'constructor',
        METHOD: 'method',
        BODY: 'body'
    },
    REACT_COMPONENT: ['React.Component', 'React.PureComponent'],
    SUBSCRIPTION_TO_UNSUBSCRIBE: 'subscriptionsToUnsubscribe',
    TIMER_TYPES: {
        INTERVAL: 0,
        TIME_OUT: 1
    },
    TYPES: {
        ARRAY: 'array',
        IS_OBSERVABLE: 'isObservable',
        SUBJECT_OBSERVABLE: 'Subject',
        SUBSCRIPTION_OBJECT: 'subscriptionObject',
        TAKE_UNTIL_OBSERVABLE: 'takeUntilObservable'
    },
    TYPESCRIPT_EXTENSIONS: ['.ts', '.tsx'],
    TYPESCRIPT: 'typescript',
    USE_EFFECT_HOOK: 'useEffect',
    USE_LAYOUT_EFFECT_HOOK: 'useLayoutEffect',
    VARIABLE_KIND: {
        LET: 'let',
        CONST: 'const'
    },
    MODIFIERS: {
        READONLY: ['readonly', 'Readonly', 'ReadonlyArray']
    },
    WINDOW_OBJECTS: ['window', 'window.document', 'document', 'document.body']
};

export default CONSTANTS;
