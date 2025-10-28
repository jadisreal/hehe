// resources/js/Pages/PatientsList.tsx
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Patient } from '../data/mockData';
import patientService from '../services/patientService';

export default function PatientsList() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await patientService.getAllPatients();
                setPatients(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load patients');
                setLoading(false);
                console.error(err);
            }
        };

        fetchPatients();
    }, []);

    if (loading) return <div className="p-4">Loading patients...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <>
            <Head title="Patients List" />
            <div className="p-4">
                <h1 className="mb-4 text-2xl font-bold">Patients</h1>

                <div className="mb-4">
                    <p>Total patients: {patients.length}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 bg-white">
                        <thead>
                            <tr>
                                <th className="border-b px-4 py-2">ID</th>
                                <th className="border-b px-4 py-2">Name</th>
                                <th className="border-b px-4 py-2">Age</th>
                                <th className="border-b px-4 py-2">Gender</th>
                                <th className="border-b px-4 py-2">Contact</th>
                                <th className="border-b px-4 py-2">Type</th>
                                <th className="border-b px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((patient) => (
                                <tr key={patient.id}>
                                    <td className="border-b px-4 py-2">{patient.id}</td>
                                    <td className="border-b px-4 py-2">{patient.name}</td>
                                    <td className="border-b px-4 py-2">{patient.age}</td>
                                    <td className="border-b px-4 py-2">{patient.gender}</td>
                                    <td className="border-b px-4 py-2">{patient.contact}</td>
                                    <td className="border-b px-4 py-2">
                                        {patient.studentInfo ? 'Student' : patient.employeeInfo ? 'Employee' : 'Unknown'}
                                    </td>
                                    <td className="border-b px-4 py-2">
                                        <button
                                            className="mr-2 rounded bg-blue-500 px-2 py-1 font-bold text-white hover:bg-blue-700"
                                            onClick={() => (window.location.href = `/patients/${patient.id}`)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
