import React from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ContactDetails} from "../components/contacts/ContactDetails.tsx";

export default function ContactDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const selectedContactId = id ? parseInt(id, 10) : null;

    if (!selectedContactId) {
        return <div>Invalid Contact ID</div>;
    }

    return (
        <ContactDetails 
            contactId={selectedContactId} 
            close={() => navigate('/contacts')} 
        />
    );
}
