# Property Platform - Modular Architecture & Configuration Strategy

## 🎯 Core Principle: **Everything Configurable & Modular**

**No hardcode, easy to swap, plug-and-play architecture**

---

## 1️⃣ Payment Gateway (Modular)

### Architecture Pattern: Strategy Pattern

```typescript
// backend/src/modules/payments/interfaces/payment-provider.interface.ts
export interface PaymentProvider {
  createTransaction(data: CreateTransactionDto): Promise<TransactionResponse>;
  verifyPayment(data: VerifyPaymentDto): Promise<PaymentVerification>;
  cancelTransaction(orderId: string): Promise<void>;
  getTransactionStatus(orderId: string): Promise<TransactionStatus>;
}

// backend/src/modules/payments/providers/midtrans.provider.ts
export class MidtransProvider implements PaymentProvider {
  constructor(private config: MidtransConfig) {}
  // Implementation
}

// backend/src/modules/payments/providers/xendit.provider.ts
export class XenditProvider implements PaymentProvider {
  constructor(private config: XenditConfig) {}
  // Implementation
}

// backend/src/modules/payments/payment.service.ts
export class PaymentService {
  private provider: PaymentProvider;
  
  constructor() {
    // Load from config
    const providerType = process.env.PAYMENT_PROVIDER || 'midtrans';
    this.provider = PaymentProviderFactory.create(providerType);
  }
}
```

### Configuration (.env)
```bash
# Payment Provider (midtrans, xendit, stripe)
PAYMENT_PROVIDER=midtrans

# Midtrans
MIDTRANS_SERVER_KEY=xxx
MIDTRANS_CLIENT_KEY=xxx
MIDTRANS_IS_PRODUCTION=false

# Xendit (for future)
XENDIT_API_KEY=xxx
XENDIT_WEBHOOK_TOKEN=xxx

# Stripe (for future)
STRIPE_SECRET_KEY=xxx
STRIPE_PUBLISHABLE_KEY=xxx
```

**Benefit:** Ganti provider cukup ubah `PAYMENT_PROVIDER=xendit` di .env!

---

## 2️⃣ Image Storage (Modular)

### Free Cloud Options:
1. **Cloudinary** - 25GB free, easy integration ✅ (Recommended)
2. **ImageKit** - 20GB free, CDN included
3. **Supabase Storage** - 1GB free
4. **Uploadcare** - 3GB free

### Architecture Pattern: Adapter Pattern

```typescript
// backend/src/modules/storage/interfaces/storage-provider.interface.ts
export interface StorageProvider {
  upload(file: Express.Multer.File, folder: string): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
  getUrl(publicId: string, options?: TransformOptions): string;
}

// backend/src/modules/storage/providers/cloudinary.provider.ts
export class CloudinaryProvider implements StorageProvider {
  constructor(private config: CloudinaryConfig) {}
  
  async upload(file: Express.Multer.File, folder: string) {
    return cloudinary.uploader.upload(file.path, { folder });
  }
}

// backend/src/modules/storage/providers/local.provider.ts
export class LocalStorageProvider implements StorageProvider {
  async upload(file: Express.Multer.File, folder: string) {
    // Save to local filesystem
  }
}

// backend/src/modules/storage/storage.service.ts
export class StorageService {
  private provider: StorageProvider;
  
  constructor() {
    const providerType = process.env.STORAGE_PROVIDER || 'cloudinary';
    this.provider = StorageProviderFactory.create(providerType);
  }
}
```

### Configuration (.env)
```bash
# Storage Provider (cloudinary, imagekit, local, supabase)
STORAGE_PROVIDER=cloudinary

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# ImageKit (for future)
IMAGEKIT_PUBLIC_KEY=xxx
IMAGEKIT_PRIVATE_KEY=xxx
IMAGEKIT_URL_ENDPOINT=xxx

# Local (for development)
STORAGE_LOCAL_PATH=./uploads
```

**Benefit:** Dev pakai local, production pakai Cloudinary, tinggal ganti config!

---

## 3️⃣ Email Service (Modular)

### Architecture Pattern: Strategy Pattern

```typescript
// backend/src/modules/notifications/interfaces/email-provider.interface.ts
export interface EmailProvider {
  send(data: SendEmailDto): Promise<EmailResult>;
  sendBulk(data: SendBulkEmailDto): Promise<EmailResult[]>;
}

// backend/src/modules/notifications/providers/console.provider.ts
export class ConsoleEmailProvider implements EmailProvider {
  async send(data: SendEmailDto) {
    console.log('📧 Email would be sent:');
    console.log('To:', data.to);
    console.log('Subject:', data.subject);
    console.log('Body:', data.body);
    return { success: true, messageId: 'console-log' };
  }
}

// backend/src/modules/notifications/providers/nodemailer.provider.ts
export class NodemailerProvider implements EmailProvider {
  private transporter: Transporter;
  
  constructor(config: NodemailerConfig) {
    this.transporter = nodemailer.createTransport(config);
  }
}

// backend/src/modules/notifications/providers/resend.provider.ts
export class ResendProvider implements EmailProvider {
  constructor(private apiKey: string) {}
  
  async send(data: SendEmailDto) {
    return resend.emails.send(data);
  }
}

// backend/src/modules/notifications/providers/cloudflare-email.provider.ts
export class CloudflareEmailProvider implements EmailProvider {
  // Cloudflare Email Routing via Worker
  async send(data: SendEmailDto) {
    // Implementation using Cloudflare API
  }
}

// backend/src/modules/notifications/email.service.ts
export class EmailService {
  private provider: EmailProvider;
  
  constructor() {
    const providerType = process.env.EMAIL_PROVIDER || 'console';
    this.provider = EmailProviderFactory.create(providerType);
  }
}
```

### Configuration (.env)
```bash
# Email Provider (console, nodemailer, resend, cloudflare, sendgrid)
EMAIL_PROVIDER=console  # Dev: console, Prod: cloudflare

# Nodemailer (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx

# Resend
RESEND_API_KEY=xxx

# Cloudflare Email Routing
CLOUDFLARE_EMAIL_API_KEY=xxx
CLOUDFLARE_EMAIL_ZONE_ID=xxx

# SendGrid (for future)
SENDGRID_API_KEY=xxx

# Email From
EMAIL_FROM_NAME=PropertyHub
EMAIL_FROM_ADDRESS=noreply@propertyhub.com
```

**Benefit:** 
- Dev: Log ke console
- Staging: SMTP
- Production: Cloudflare Email Routing (no spam!)

---

## 4️⃣ Search Engine (Modular)

### Architecture Pattern: Strategy Pattern

```typescript
// backend/src/modules/search/interfaces/search-provider.interface.ts
export interface SearchProvider {
  index(property: Property): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult>;
  delete(propertyId: string): Promise<void>;
}

// backend/src/modules/search/providers/postgres.provider.ts
export class PostgresSearchProvider implements SearchProvider {
  async search(query: SearchQuery) {
    // Use PostgreSQL full-text search
    return prisma.property.findMany({
      where: {
        OR: [
          { title: { search: query.text } },
          { description: { search: query.text } }
        ]
      }
    });
  }
}

// backend/src/modules/search/providers/elasticsearch.provider.ts
export class ElasticsearchProvider implements SearchProvider {
  async search(query: SearchQuery) {
    // Use Elasticsearch
    return client.search({
      index: 'properties',
      body: { query: { match: { title: query.text } } }
    });
  }
}

// backend/src/modules/search/search.service.ts
export class SearchService {
  private provider: SearchProvider;
  
  constructor() {
    const providerType = process.env.SEARCH_PROVIDER || 'postgres';
    this.provider = SearchProviderFactory.create(providerType);
  }
}
```

### Configuration (.env)
```bash
# Search Provider (postgres, elasticsearch, algolia, meilisearch)
SEARCH_PROVIDER=postgres  # MVP: postgres, Scale: elasticsearch

# Elasticsearch (for future)
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=xxx
ELASTICSEARCH_PASSWORD=xxx

# Algolia (for future)
ALGOLIA_APP_ID=xxx
ALGOLIA_API_KEY=xxx

# Meilisearch (for future)
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=xxx
```

**Benefit:** Start with PostgreSQL, scale to Elasticsearch when needed!

---

## 5️⃣ Configuration Management

### Centralized Config Module

```typescript
// backend/src/config/configuration.ts
export default () => ({
  app: {
    name: process.env.APP_NAME || 'PropertyHub',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3001,
    url: process.env.APP_URL || 'http://localhost:3000',
  },
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'midtrans',
    midtrans: {
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    },
    xendit: {
      apiKey: process.env.XENDIT_API_KEY,
    },
  },
  
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'cloudinary',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    local: {
      path: process.env.STORAGE_LOCAL_PATH || './uploads',
    },
  },
  
  email: {
    provider: process.env.EMAIL_PROVIDER || 'console',
    from: {
      name: process.env.EMAIL_FROM_NAME || 'PropertyHub',
      address: process.env.EMAIL_FROM_ADDRESS || 'noreply@propertyhub.com',
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
    },
    cloudflare: {
      apiKey: process.env.CLOUDFLARE_EMAIL_API_KEY,
      zoneId: process.env.CLOUDFLARE_EMAIL_ZONE_ID,
    },
  },
  
  search: {
    provider: process.env.SEARCH_PROVIDER || 'postgres',
    elasticsearch: {
      node: process.env.ELASTICSEARCH_NODE,
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
  },
  
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
    enableSocialLogin: process.env.ENABLE_SOCIAL_LOGIN === 'true',
    enablePropertyModeration: process.env.ENABLE_PROPERTY_MODERATION === 'true',
    maxImagesPerProperty: parseInt(process.env.MAX_IMAGES_PER_PROPERTY, 10) || 20,
    maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE, 10) || 5242880, // 5MB
  },
});
```

### Environment Files

```bash
# .env.development
NODE_ENV=development
APP_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property_dev

PAYMENT_PROVIDER=midtrans
STORAGE_PROVIDER=local
EMAIL_PROVIDER=console
SEARCH_PROVIDER=postgres

# .env.production
NODE_ENV=production
APP_URL=https://property.yourdomain.com

DATABASE_URL=postgresql://user:pass@homelab:5432/property_prod

PAYMENT_PROVIDER=midtrans
STORAGE_PROVIDER=cloudinary
EMAIL_PROVIDER=cloudflare
SEARCH_PROVIDER=postgres

# .env.staging
NODE_ENV=staging
APP_URL=https://staging.property.yourdomain.com

PAYMENT_PROVIDER=midtrans
STORAGE_PROVIDER=cloudinary
EMAIL_PROVIDER=nodemailer
SEARCH_PROVIDER=postgres
```

---

## 6️⃣ Feature Flags

```typescript
// backend/src/config/features.config.ts
export const features = {
  registration: {
    enabled: process.env.ENABLE_REGISTRATION !== 'false',
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
  },
  
  socialLogin: {
    enabled: process.env.ENABLE_SOCIAL_LOGIN === 'true',
    providers: (process.env.SOCIAL_LOGIN_PROVIDERS || 'google,facebook').split(','),
  },
  
  propertyModeration: {
    enabled: process.env.ENABLE_PROPERTY_MODERATION === 'true',
    autoApprove: process.env.AUTO_APPROVE_PROPERTIES === 'true',
  },
  
  featuredAds: {
    enabled: process.env.ENABLE_FEATURED_ADS !== 'false',
    prices: {
      basic: parseInt(process.env.FEATURED_BASIC_PRICE, 10) || 50000,
      premium: parseInt(process.env.FEATURED_PREMIUM_PRICE, 10) || 100000,
      ultimate: parseInt(process.env.FEATURED_ULTIMATE_PRICE, 10) || 200000,
    },
  },
  
  analytics: {
    enabled: process.env.ENABLE_ANALYTICS === 'true',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  },
};
```

---

## 7️⃣ Dependency Injection (NestJS)

```typescript
// backend/src/modules/payments/payment.module.ts
@Module({
  providers: [
    {
      provide: 'PAYMENT_PROVIDER',
      useFactory: (configService: ConfigService) => {
        const provider = configService.get('payment.provider');
        
        switch (provider) {
          case 'midtrans':
            return new MidtransProvider(configService.get('payment.midtrans'));
          case 'xendit':
            return new XenditProvider(configService.get('payment.xendit'));
          default:
            throw new Error(`Unknown payment provider: ${provider}`);
        }
      },
      inject: [ConfigService],
    },
    PaymentService,
  ],
})
export class PaymentModule {}
```

---

## 8️⃣ Frontend Configuration

```typescript
// frontend/lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
  features: {
    enableSocialLogin: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === 'true',
    enablePropertyComparison: process.env.NEXT_PUBLIC_ENABLE_COMPARISON === 'true',
  },
  
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  },
  
  maps: {
    provider: process.env.NEXT_PUBLIC_MAP_PROVIDER || 'leaflet',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  },
  
  payment: {
    midtransClientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  },
};
```

---

## ✅ Benefits of This Architecture

1. **Easy to swap providers** - Change .env, restart, done!
2. **Environment-specific** - Dev uses console/local, prod uses cloud
3. **No vendor lock-in** - Not tied to any specific service
4. **Testable** - Mock providers easily
5. **Scalable** - Start simple, upgrade when needed
6. **Maintainable** - Clear separation of concerns
7. **Cost-effective** - Use free tiers, upgrade gradually

---

## 🎯 Recommended MVP Configuration

```bash
# Development
PAYMENT_PROVIDER=midtrans  # Test mode
STORAGE_PROVIDER=local     # Filesystem
EMAIL_PROVIDER=console     # Log only
SEARCH_PROVIDER=postgres   # Built-in

# Production
PAYMENT_PROVIDER=midtrans  # Live mode
STORAGE_PROVIDER=cloudinary # Free 25GB
EMAIL_PROVIDER=cloudflare  # Email routing
SEARCH_PROVIDER=postgres   # Sufficient for MVP
```

---

## 📝 Additional Considerations

### 1. Rate Limiting (Modular)
```typescript
// Configurable per endpoint
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per 60 seconds
```

### 2. Caching (Modular)
```typescript
// Redis or in-memory
CACHE_PROVIDER=memory  // Dev
CACHE_PROVIDER=redis   // Prod
```

### 3. Logging (Modular)
```typescript
// Console, file, or external service
LOG_PROVIDER=console     // Dev
LOG_PROVIDER=winston     // Prod
LOG_PROVIDER=datadog     // Enterprise
```

### 4. Queue System (Modular)
```typescript
// For background jobs
QUEUE_PROVIDER=memory    // Dev
QUEUE_PROVIDER=bull      // Prod (Redis-based)
```

---

## 🚀 Ready to Build?

Dengan arsitektur modular ini:
- ✅ No hardcode
- ✅ Easy to swap services
- ✅ Environment-specific configs
- ✅ Scalable from MVP to enterprise
- ✅ Cost-effective (start free, upgrade gradually)

**Mau saya mulai setup project dengan arsitektur ini sekarang?**
