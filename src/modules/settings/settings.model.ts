import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  businessName: string;
  businessType: string[];
  businessLogo?: string;
  description?: string;

  contact: {
    phone: { label: string; phoneNo: number }[];
    email: { email: string }[];
    links: { label: string; url: string }[];
  };

  address: {
    location: string;
    line1: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  }[];

  taxDetails: {
    gstNumber: string;
    panNumber: string;
  };

  bankDetails: {
    bankName: string;
    branchName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    upiId?: string;
  }[];

  owner: {
    ownerName: string;
    signature?: string;

    ownerContact: {
      phone: { label: string; phoneNo: number }[];
      email: { email: string }[];
      links: { label: string; url: string }[];
    };

    address: {
      location: string;
      line1: string;
      city: string;
      state: string;
      country: string;
      pinCode: string;
    }[];
  };

  documents: {
    aadhar: {
      aadharNumber: string;
      aadharPhoto?: string;
    };
    pan: {
      panNumber: string;
      panPhoto?: string;
    };
  };
}

const SettingsSchema = new Schema<ISettings>(
  {
    businessName: { type: String, required: true },
    businessType: [{ type: String }],
    businessLogo: String,
    description: String,

    contact: {
      phone: [{ label: String, phoneNo: Number }],
      email: [{ email: String }],
      links: [{ label: String, url: String }],
    },

    address: [
      {
        location: String,
        line1: String,
        city: String,
        state: String,
        country: String,
        pinCode: String,
      },
    ],

    taxDetails: {
      gstNumber: String,
      panNumber: String,
    },

    bankDetails: [
      {
        bankName: String,
        branchName: String,
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
        upiId: String,
      },
    ],

    owner: {
      ownerName: String,
      signature: String,

      ownerContact: {
        phone: [{ label: String, phoneNo: Number }],
        email: [{ email: String }],
        links: [{ label: String, url: String }],
      },

      address: [
        {
          location: String,
          line1: String,
          city: String,
          state: String,
          country: String,
          pinCode: String,
        },
      ],
    },

    documents: {
      aadhar: {
        aadharNumber: String,
        aadharPhoto: String,
      },
      pan: {
        panNumber: String,
        panPhoto: String,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>("Settings", SettingsSchema);