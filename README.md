# Lasso - All-in-One Loyalty Program Platform

![Lasso Logo](public/gaiuslogo-app.png)

Lasso is a blockchain-powered loyalty program platform built on Algorand that enables businesses to create, manage, and grow customer loyalty programs with ease. The platform leverages blockchain technology to provide transparent, secure, and interoperable loyalty experiences.

## Features

### For Businesses

- **Loyalty Program Creation**: Create custom loyalty programs with branded visuals and tiered rewards
- **Member Management**: Track and manage program members, view analytics, and engage with customers
- **XP & Points System**: Award points to customers for actions and track their progress through reward tiers
- **Messaging Center**: Communicate directly with loyalty program members
- **Analytics Dashboard**: View program performance metrics and member engagement statistics
- **Multi-Network Support**: Run programs on Algorand TestNet or MainNet
- **Multiple Storage Providers**: Choose between Pinata and Lighthouse for storing media assets

### For Customers

- **Digital Loyalty Cards**: Store all loyalty memberships in one digital wallet
- **Points Tracking**: View points balance and progress towards reward tiers
- **Reward Redemption**: Redeem points for exclusive rewards
- **Cross-Brand Benefits**: Use loyalty points across participating businesses in the network

## Technology Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Blockchain**: Algorand (TestNet & MainNet)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: IPFS via Pinata and Lighthouse
- **Wallet Integration**: Pera Wallet, Defly, Lute, Exodus, WalletConnect

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or pnpm
- Algorand account and wallet
- Supabase account for authentication and database
- Pinata and/or Lighthouse account for IPFS storage

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Algorand Network
VITE_TESTNET_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_MAINNET_ALGOD_SERVER=https://mainnet-api.algonode.cloud
VITE_TESTNET_INDEXER_URL=https://testnet-idx.algonode.cloud
VITE_MAINNET_INDEXER_URL=https://mainnet-idx.algonode.cloud
VITE_TESTNET_EXPLORER_URL=https://lora.algokit.io/testnet
VITE_MAINNET_EXPLORER_URL=https://lora.algokit.io/mainnet

# WalletConnect
VITE_PROJECT_ID=your_walletconnect_project_id

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# IPFS/Pinata
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_api_secret
VITE_PINATA_JWT=your_pinata_jwt
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud

# Lighthouse (Alternative IPFS Provider)
VITE_LIGHTHOUSE_API_KEY=your_lighthouse_api_key

# Subscription
VITE_SUBSCRIPTION_WALLET=your_subscription_wallet_address
```

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/lasso.git
   cd lasso
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Database Setup

The application requires a Supabase database with the following tables:

1. `organization_admins` - Stores information about organization administrators
   - `id`: UUID (primary key)
   - `wallet_address`: String (Algorand address)
   - `full_name`: String
   - `email`: String
   - `subscription_plan`: String
   - `storage_provider`: String (default: 'pinata')
   - `created_at`: Timestamp

2. Other tables for managing loyalty programs, members, and transactions.

## Storage Providers

Lasso supports multiple IPFS storage providers for media assets:

- **Pinata**: Default provider, reliable and widely used IPFS pinning service
- **Lighthouse**: Alternative provider with decentralized storage features

Organization admins can choose their preferred provider in the Account Settings page. The system includes automatic fallback - if the preferred provider is unavailable, it will automatically use the alternative provider.

## Subscription Plans

Lasso offers multiple subscription tiers for businesses:

- **Basic**: 5 ALGO/month - Up to 250 members, 5 loyalty programs
- **Professional**: 20 ALGO/month - Up to 2,500 members, 20 loyalty programs
- **Enterprise**: 50 ALGO/month - Unlimited members and programs

## Project Structure

```
src/
├── components/          # React components
│   ├── LoyaltyProgramMinter.tsx
│   ├── LoyaltyProgramDashboard.tsx
│   ├── UserSettings.tsx
│   ├── StorageProviderTest.tsx
│   └── ...
├── utils/              # Utility functions
│   ├── storage.ts      # Storage provider management
│   ├── lighthouse.ts   # Lighthouse IPFS integration
│   ├── pinata.ts       # Pinata IPFS integration
│   ├── algod.ts        # Algorand client utilities
│   └── ...
├── routes/             # Page components
├── pages/              # Additional page components
└── services/           # Service layer
```

## Key Features

### Storage Provider Management
- **Provider Selection**: Admins can choose between Pinata and Lighthouse
- **Automatic Fallback**: Seamless fallback to alternative provider if primary fails
- **Transparent Operation**: Users are informed of provider changes through UI
- **Database Persistence**: Provider preferences stored in database

### Loyalty Program Management
- **Multi-step Creation**: Guided process for creating loyalty programs
- **Custom Branding**: Upload custom banners and set brand colors
- **Tiered Rewards**: Create multiple reward tiers with different point requirements
- **Real-time Analytics**: Track program performance and member engagement

### Member Management
- **Digital Passes**: Issue loyalty passes as Algorand assets
- **Points System**: Award and track points for member actions
- **Messaging**: Direct communication with program members
- **Transfer Support**: Allow members to transfer loyalty passes

## Building for Production

```bash
npm run build
# or
pnpm build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

The application can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages. Make sure to configure environment variables on your hosting platform.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- TailwindCSS for styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact:
- Email: support@lasso.com
- Discord: [Lasso Community](https://discord.gg/lasso)
- Documentation: [docs.lasso.com](https://docs.lasso.com)

## Acknowledgments

- Powered by [Algorand](https://www.algorand.com/)
- Wallet connectivity via [Use Wallet](https://github.com/txnlab/use-wallet)
- Authentication and database by [Supabase](https://supabase.com/)
- IPFS storage via [Pinata](https://www.pinata.cloud/) and [Lighthouse](https://lighthouse.storage/)

## Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with more blockchains
- [ ] AI-powered member insights
- [ ] White-label solutions
- [ ] API for third-party integrations

---

**Lasso** - Building the future of loyalty programs on blockchain technology. 