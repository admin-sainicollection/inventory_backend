// utils/initializeDefaultData.ts

import Party from "../modules/party/party.model";

export const seedDefaultUnknownCustomer = async () => {
    try {
        // Check if the default "Unknown" party already exists
        const existingParty = await Party.findOne({ 
            partyName: 'Walk-in Customer',
            entityCategory: 'WALK_IN_CUSTOMER' 
        });

        if (!existingParty) {
            // Create the default party
            const defaultParty = new Party({
                partyName: 'Walk-in Customer',
                nickName: 'Unknown',
                entityCategory: 'WALK_IN_CUSTOMER',
                enquiryStatus: 'PENDING',
                withGST: false,
                contact: {
                    phone: [{
                        label: 'mobile',
                        phoneNo: '0000000000'
                    }],
                    email: ['unknown@system.local']
                },
                location: 'Location Unknown',
                status: 'active',
                role: 'party'
            });

            await defaultParty.save();
        } else {
        }
    } catch (error) {
        console.error('❌ Error creating default party:', error);
    }
};