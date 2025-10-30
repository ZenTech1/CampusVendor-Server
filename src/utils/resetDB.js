import prisma from "./prisma.js";

async function clearAll() {
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartProduct.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Database cleared.");
  await prisma.$disconnect();
}

clearAll();
