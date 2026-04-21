export { OrdersView } from "./views/orders-view";
export {
	useOrders,
	useOrder,
	useCreateOrder,
	useUpdateOrder,
	useDeleteOrder,
} from "./hooks/use-orders";
export { ordersService } from "./services/orders.service";
export type { OrderListQuery, OrderRecord } from "./services/orders.service";
