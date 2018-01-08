import { browserHistory } from 'react-router';


export const VisitPage = (path) => {
    browserHistory.push('/' + path);
}

