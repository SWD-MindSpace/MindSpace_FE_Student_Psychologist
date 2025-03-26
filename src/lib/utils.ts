import { toast } from 'react-hot-toast';

export const registerForProgram = async (programId: number) => {
    try {
        const studentId = localStorage.getItem("userId");
        const userRole = localStorage.getItem("userRole");

        console.log("DEBUG - Student ID:", studentId);
        console.log("DEBUG - User Role:", userRole);

        if (!studentId) {
            toast.error("You have to log in to register for program.");
            return;
        }

        if (!userRole) {
            toast.error("User role is missing. Please log in again.");
            return;
        }

        if (userRole === "Parent") {
            toast.error("Only students can register for programs.");
            return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supporting-programs/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId, supportingProgramId: programId }),
        });

        if (response.status === 204) {
            toast.success('Registration succeeded!');
            return;
        }

        if (response.status === 409) {
            toast.error("You are already registered for this program.");
            return;
        }

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        toast.success('Registration succeeded!');
    } catch (error) {
        console.error('Error registering:', error);
        toast.error('Registration failed. Please try again.');
    }
};
