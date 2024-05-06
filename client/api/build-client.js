import axios from "axios";

export default ({ req }) => {
    if (typeof window === 'undefined') {
        // We are on the server
        const domain = 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local';
        return axios.create({
            baseURL: domain,
            headers: req.headers
        });
    } else {
        // We must be on the browser
        return axios.create({
            baseURL: '/'
        });
    }
}