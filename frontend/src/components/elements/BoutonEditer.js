import { Button } from "react-bootstrap";

export default function BoutonEditer({ onClick }) {
    return (
        <Button variant="outline-primary" className="float-end" onClick={onClick}>
            <img src="/assets/icons/edit.svg" alt="Edit" /> Éditer
        </Button>
    );
}
