import React from "react";
import { Button, Text, View } from "react-native";

interface ErrorBoundaryProps {
    children?: React.ReactNode; // 👈 Define children in props
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: unknown;
}

export default class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: unknown) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // console.error("Error caught by ErrorBoundary:", error, errorInfo);
        return
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>Something went wrong</Text>
                    <Text>{String(this.state.error)}</Text>
                    <Button title="Try Again" onPress={this.handleReset} />
                </View>
            );
        }

        return this.props.children || null;
    }
}
