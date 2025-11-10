

import { Colors } from "@/constants/Colors";
import { TherapistData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BankDetails {
    id?: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    // routingNumber: string;
    // accountType: 'checking' | 'savings';
    isDefault: boolean;
}

interface PayoutRequest {
    id: string;
    amount: number;
    requestDate: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    bankDetails: BankDetails;
    estimatedArrival?: string;
}

interface EarningProps {
    isEarningsModalVisible: boolean
    setIsEarningsModalVisible: Dispatch<SetStateAction<boolean>>
    activeEarningsTab: 'overview' | 'banking' | 'payout'
    setActiveEarningsTab: Dispatch<SetStateAction<'overview' | 'banking' | 'payout'>>
    therapistData: TherapistData | undefined
}

const EarningModal: React.FC<EarningProps> = ({
    isEarningsModalVisible,
    setIsEarningsModalVisible,
    activeEarningsTab,
    setActiveEarningsTab,
    therapistData
}) => {
    const [bankDetails, setBankDetails] = useState<BankDetails[]>([]);
    const [newBankDetails, setNewBankDetails] = useState<BankDetails>({
        bankName: '',
        accountName: '',
        accountNumber: '',
        // routingNumber: '',
        // accountType: 'checking',
        isDefault: false,
    });

    const [payoutAmount, setPayoutAmount] = useState<string>('');
    const [selectedBankForPayout, setSelectedBankForPayout] = useState<string>('');
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const styles = createStyles(colors);

    const addBankAccount = () => {
        if (!newBankDetails.bankName.trim() || !newBankDetails.accountName.trim() ||
            !newBankDetails.accountNumber.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const bankAccount: BankDetails = {
            id: Date.now().toString(),
            ...newBankDetails,
            isDefault: bankDetails.length === 0 || newBankDetails.isDefault,
        };

        const updatedBankDetails = bankDetails.map(bank => ({
            ...bank,
            isDefault: newBankDetails.isDefault ? false : bank.isDefault
        }));

        setBankDetails([...updatedBankDetails, bankAccount]);
        setNewBankDetails({
            bankName: '',
            accountName: '',
            accountNumber: '',
            // routingNumber: '',
            // accountType: 'checking',
            isDefault: false,
        });

        Alert.alert('Success', 'Bank account added successfully');
    };

    const requestPayout = () => {
        const amount = parseFloat(payoutAmount);
        const availableBalance = therapistData?.result[0]?.balance || 0;

        if (!amount || amount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (amount > availableBalance) {
            Alert.alert('Error', `Insufficient balance. Available: $${availableBalance.toFixed(2)}`);
            return;
        }

        if (!selectedBankForPayout) {
            Alert.alert('Error', 'Please select a bank account');
            return;
        }

        const selectedBank = bankDetails.find(bank => bank.id === selectedBankForPayout);
        if (!selectedBank) return;

        const newPayout: PayoutRequest = {
            id: Date.now().toString(),
            amount,
            requestDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            bankDetails: selectedBank,
            estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        setPayoutRequests([newPayout, ...payoutRequests]);
        setPayoutAmount('');
        setSelectedBankForPayout('');

        Alert.alert('Success', 'Payout request submitted successfully. You will receive an email confirmation shortly.');
    };

    const getPayoutStatusColor = (status: PayoutRequest['status']) => {
        switch (status) {
            case 'completed': return '#10B981';
            case 'processing': return '#3B82F6';
            case 'pending': return '#F59E0B';
            case 'failed': return '#EF4444';
            default: return '#6B7280';
        }
    };

    return (
        <Modal
            visible={isEarningsModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Earnings</Text>
                        <TouchableOpacity
                            onPress={() => setIsEarningsModalVisible(false)}
                        // style={styles.closeButton}
                        >
                            {/* <Text style={styles.closeButtonText}>✕</Text> */}
                            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Tab Navigation */}
                    <View style={styles.tabContainer}>
                        {(['overview', 'banking', 'payout'] as const).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeEarningsTab === tab && styles.tabActive]}
                                onPress={() => setActiveEarningsTab(tab)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.tabText, activeEarningsTab === tab && styles.tabTextActive]}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.contentContainer}
                    >
                        {/* Overview Tab */}
                        {activeEarningsTab === 'overview' && (
                            <View>
                                {/* Balance Card */}
                                <View style={styles.balanceCard}>
                                    <Text style={styles.balanceLabel}>Total Balance</Text>
                                    <Text style={styles.balanceAmount}>
                                        ${(therapistData?.result[0]?.balance || 0).toFixed(2)}
                                    </Text>
                                    <View style={styles.balanceRow}>
                                        <View style={styles.balanceItem}>
                                            <Text style={styles.balanceSubLabel}>Pending</Text>
                                            <Text style={styles.balanceSubAmount}>
                                                ${(therapistData?.result[0]?.pending || 0).toFixed(2)}
                                            </Text>
                                        </View>
                                        <View style={styles.balanceDivider} />
                                        <View style={styles.balanceItem}>
                                            <Text style={styles.balanceSubLabel}>Total Earned</Text>
                                            <Text style={styles.balanceSubAmount}>
                                                ${(therapistData?.result[0]?.total_earning || 0).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Recent Payouts */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                                    {payoutRequests.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            {/* <Ionicons style={styles.emptyStateIcon} name="list-outline" size={48} color={colors.textSecondary} /> */}
                                            <Text style={styles.emptyStateIcon}>💸</Text>
                                            <Text style={styles.emptyStateText}>No transactions yet</Text>
                                            <Text style={styles.emptyStateSubtext}>Your payout history will appear here</Text>
                                        </View>
                                    ) : (
                                        payoutRequests.slice(0, 5).map(payout => (
                                            <View key={payout.id} style={styles.transactionItem}>
                                                <View style={styles.transactionLeft}>
                                                    <View style={[styles.transactionIcon, { backgroundColor: getPayoutStatusColor(payout.status) + '20' }]}>
                                                        <Text style={styles.transactionIconText}>💰</Text>
                                                    </View>
                                                    <View style={styles.transactionInfo}>
                                                        <Text style={styles.transactionTitle}>Payout</Text>
                                                        <Text style={styles.transactionDate}>
                                                            {new Date(payout.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View style={styles.transactionRight}>
                                                    <Text style={styles.transactionAmount}>-${payout.amount.toFixed(2)}</Text>
                                                    <View style={[styles.statusBadge, { backgroundColor: getPayoutStatusColor(payout.status) }]}>
                                                        <Text style={styles.statusText}>{payout.status}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Banking Tab */}
                        {activeEarningsTab === 'banking' && (

                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View>
                                    {/* Saved Accounts */}
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Bank Accounts</Text>
                                        {bankDetails.length === 0 ? (
                                            <View style={styles.emptyState}>
                                                {/* <Ionicons style={styles.emptyStateIcon} name="card-outline" size={48} color={colors.textSecondary} /> */}
                                                <Text style={styles.emptyStateIcon}>🏦</Text>
                                                <Text style={styles.emptyStateText}>No accounts added</Text>
                                                <Text style={styles.emptyStateSubtext}>Add a bank account to receive payouts</Text>
                                            </View>
                                        ) : (
                                            bankDetails.map(bank => (
                                                <View key={bank.id} style={styles.bankCard}>
                                                    <View style={styles.bankCardHeader}>
                                                        <View style={styles.bankIcon}>
                                                            <Text style={styles.bankIconText}>🏦</Text>
                                                        </View>
                                                        {bank.isDefault && (
                                                            <View style={styles.defaultChip}>
                                                                <Text style={styles.defaultChipText}>Default</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text style={styles.bankCardName}>{bank.bankName}</Text>
                                                    <Text style={styles.bankCardNumber}>•••• •••• •••• {bank.accountNumber.slice(-4)}</Text>
                                                    <Text style={styles.bankCardHolder}>{bank.accountName}</Text>
                                                    {/* <Text style={styles.bankCardType}>{bank.accountType}</Text> */}
                                                </View>
                                            ))
                                        )}
                                    </View>

                                    {/* Add Bank Form */}

                                    {/* <ScrollView
                                        contentContainerStyle={{ paddingBottom: 20 }}
                                        keyboardShouldPersistTaps="handled"
                                        showsVerticalScrollIndicator={false}
                                    > */}
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Add New Account</Text>

                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>Bank Name</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={newBankDetails.bankName}
                                                onChangeText={(text) => setNewBankDetails(prev => ({ ...prev, bankName: text }))}
                                                placeholder="GTCO Group, Access bank, etc."
                                                placeholderTextColor={colors.placeholder}
                                            />
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>Account Holder Name</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={newBankDetails.accountName}
                                                onChangeText={(text) => setNewBankDetails(prev => ({ ...prev, accountName: text }))}
                                                placeholder="Full name on account"
                                                placeholderTextColor={colors.placeholder}
                                            />
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>Account Number</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={newBankDetails.accountNumber}
                                                onChangeText={(text) => setNewBankDetails(prev => ({ ...prev, accountNumber: text }))}
                                                placeholder="Enter account number"
                                                placeholderTextColor={colors.placeholder}
                                                keyboardType="numeric"
                                                secureTextEntry
                                            />
                                        </View>

                                        {/* <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Routing Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newBankDetails.routingNumber}
                                        onChangeText={(text) => setNewBankDetails(prev => ({ ...prev, routingNumber: text }))}
                                        placeholder="9-digit routing number"
                                        placeholderTextColor={colors.placeholder}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Account Type</Text>
                                    <View style={styles.accountTypeRow}>
                                        <TouchableOpacity
                                            style={[styles.accountTypeChip, newBankDetails.accountType === 'checking' && styles.accountTypeChipActive]}
                                            onPress={() => setNewBankDetails(prev => ({ ...prev, accountType: 'checking' }))}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.accountTypeText, newBankDetails.accountType === 'checking' && styles.accountTypeTextActive]}>
                                                Checking
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.accountTypeChip, newBankDetails.accountType === 'savings' && styles.accountTypeChipActive]}
                                            onPress={() => setNewBankDetails(prev => ({ ...prev, accountType: 'savings' }))}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.accountTypeText, newBankDetails.accountType === 'savings' && styles.accountTypeTextActive]}>
                                                Savings
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View> */}

                                        <TouchableOpacity
                                            style={styles.checkboxRow}
                                            onPress={() => setNewBankDetails(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.checkbox, newBankDetails.isDefault && styles.checkboxChecked]}>
                                                {newBankDetails.isDefault && <Text style={styles.checkmark}>✓</Text>}
                                            </View>
                                            <Text style={styles.checkboxLabel}>Set as default account</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.primaryButton}
                                            onPress={addBankAccount}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.primaryButtonText}>Add Bank Account</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {/* </ScrollView> */}
                                </View>
                            </TouchableWithoutFeedback>

                        )}

                        {/* Payout Tab */}
                        {activeEarningsTab === 'payout' && (
                            <View>
                                {/* Payout Form */}
                                <View style={styles.section}>
                                    <View style={styles.payoutHeader}>
                                        <Text style={styles.sectionTitle}>Request Payout</Text>
                                        <View style={styles.availableChip}>
                                            <Text style={styles.availableText}>
                                                ${(therapistData?.result[0]?.balance || 0).toFixed(2)} available
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.amountInputContainer}>
                                        <Text style={styles.currencySymbol}>$</Text>
                                        <TextInput
                                            style={styles.amountInput}
                                            value={payoutAmount}
                                            onChangeText={setPayoutAmount}
                                            placeholder="0.00"
                                            placeholderTextColor={colors.placeholder}
                                            keyboardType="decimal-pad"
                                        />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Select Account</Text>
                                        {bankDetails.length === 0 ? (
                                            <View style={styles.warningBox}>
                                                <Text style={styles.warningText}>⚠️ No bank accounts available</Text>
                                                <Text style={styles.warningSubtext}>Add one in the Banking tab</Text>
                                            </View>
                                        ) : (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bankScroll}>
                                                {bankDetails.map(bank => (
                                                    <TouchableOpacity
                                                        key={bank.id}
                                                        style={[
                                                            styles.bankSelectCard,
                                                            selectedBankForPayout === bank.id && styles.bankSelectCardActive
                                                        ]}
                                                        onPress={() => setSelectedBankForPayout(bank.id!)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={styles.bankSelectIcon}>🏦</Text>
                                                        <Text style={[
                                                            styles.bankSelectName,
                                                            selectedBankForPayout === bank.id && styles.bankSelectNameActive
                                                        ]}>
                                                            {bank.bankName}
                                                        </Text>
                                                        <Text style={[
                                                            styles.bankSelectNumber,
                                                            selectedBankForPayout === bank.id && styles.bankSelectNumberActive
                                                        ]}>
                                                            •••• {bank.accountNumber.slice(-4)}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.primaryButton,
                                            (!payoutAmount || !selectedBankForPayout || bankDetails.length === 0) && styles.primaryButtonDisabled
                                        ]}
                                        onPress={requestPayout}
                                        disabled={!payoutAmount || !selectedBankForPayout || bankDetails.length === 0}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.primaryButtonText}>Request Payout</Text>
                                    </TouchableOpacity>

                                    <Text style={styles.infoText}>
                                        ⏱️ Payouts typically arrive within 1-3 business days
                                    </Text>
                                </View>

                                {/* Payout History */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Payout History</Text>
                                    {payoutRequests.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyStateIcon}>📋</Text>
                                            <Text style={styles.emptyStateText}>No payout history</Text>
                                            <Text style={styles.emptyStateSubtext}>Request your first payout above</Text>
                                        </View>
                                    ) : (
                                        payoutRequests.map(payout => (
                                            <View key={payout.id} style={styles.payoutHistoryCard}>
                                                <View style={styles.payoutHistoryHeader}>
                                                    <Text style={styles.payoutHistoryAmount}>
                                                        ${payout.amount.toFixed(2)}
                                                    </Text>
                                                    <View style={[styles.statusBadge, { backgroundColor: getPayoutStatusColor(payout.status) }]}>
                                                        <Text style={styles.statusText}>{payout.status}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.payoutHistoryDetails}>
                                                    <Text style={styles.payoutHistoryLabel}>Bank Account</Text>
                                                    <Text style={styles.payoutHistoryValue}>
                                                        {payout.bankDetails.bankName} •••• {payout.bankDetails.accountNumber.slice(-4)}
                                                    </Text>
                                                </View>
                                                <View style={styles.payoutHistoryDetails}>
                                                    <Text style={styles.payoutHistoryLabel}>Requested</Text>
                                                    <Text style={styles.payoutHistoryValue}>
                                                        {new Date(payout.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </Text>
                                                </View>
                                                {payout.estimatedArrival && payout.status === 'processing' && (
                                                    <View style={styles.payoutHistoryDetails}>
                                                        <Text style={styles.payoutHistoryLabel}>Est. Arrival</Text>
                                                        <Text style={[styles.payoutHistoryValue, { color: '#3B82F6' }]}>
                                                            {new Date(payout.estimatedArrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        ))
                                    )}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        // backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: -0.5,
    },
    // closeButton: {
    //     width: 32,
    //     height: 32,
    //     borderRadius: 16,
    //     backgroundColor: '#F3F4F6',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // },
    // closeButtonText: {
    //     fontSize: 18,
    //     color: colors.textSecondary,
    //     fontWeight: '600',
    // },
    tabContainer: {
        flexDirection: 'row',
        // backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#6366F1',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textTertiary,
    },
    tabTextActive: {
        color: '#6366F1',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    balanceCard: {
        backgroundColor: '#6366F1',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#E0E7FF',
        fontWeight: '500',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 24,
        letterSpacing: -1,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceItem: {
        flex: 1,
    },
    balanceSubLabel: {
        fontSize: 12,
        color: '#C7D2FE',
        fontWeight: '500',
        marginBottom: 4,
    },
    balanceSubAmount: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    balanceDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#818CF8',
        marginHorizontal: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        backgroundColor: colors.surface,
        borderRadius: 16,
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.placeholder,
        marginBottom: 4,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    transactionIconText: {
        fontSize: 20,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 13,
        color: colors.textTertiary,
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'capitalize',
    },
    bankCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bankCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    bankIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bankIconText: {
        fontSize: 20,
    },
    defaultChip: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultChipText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1E40AF',
        textTransform: 'uppercase',
    },
    bankCardName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    bankCardNumber: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 12,
        letterSpacing: 1,
    },
    bankCardHolder: {
        fontSize: 13,
        color: colors.placeholder,
        marginBottom: 4,
    },
    bankCardType: {
        fontSize: 12,
        color: colors.placeholder,
        textTransform: 'capitalize',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.inputText,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: colors.inputText,
    },
    accountTypeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    accountTypeChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    accountTypeChipActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#6366F1',
    },
    accountTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    accountTypeTextActive: {
        color: '#6366F1',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: '#6366F1',
        borderColor: '#6366F1',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: '#6366F1',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonDisabled: {
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    payoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    availableChip: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    availableText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#065F46',
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderWidth: 2,
        borderColor: colors.inputBorder,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginBottom: 24,
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.placeholder,
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 36,
        fontWeight: '700',
        color: colors.inputText,
        padding: 0,
    },
    warningBox: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    warningText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
        marginBottom: 4,
    },
    warningSubtext: {
        fontSize: 13,
        color: '#B45309',
    },
    bankScroll: {
        marginTop: 8,
    },
    bankSelectCard: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        minWidth: 140,
        alignItems: 'center',
    },
    bankSelectCardActive: {
        backgroundColor: colors.surface,
        borderColor: '#6366F1',
    },
    bankSelectIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    bankSelectName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 4,
        textAlign: 'center',
    },
    bankSelectNameActive: {
        color: '#6366F1',
    },
    bankSelectNumber: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    bankSelectNumberActive: {
        color: '#818CF8',
    },
    infoText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 18,
    },
    payoutHistoryCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    payoutHistoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    payoutHistoryAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.inputText,
    },
    payoutHistoryDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    payoutHistoryLabel: {
        fontSize: 13,
        color: colors.placeholder,
        fontWeight: '500',
    },
    payoutHistoryValue: {
        fontSize: 14,
        color: colors.inputText,
        fontWeight: '600',
    },
});

export default EarningModal;