import { useState } from 'react'
import { Loan, ValidationError } from '../../types'
import { validateLoan, generateId } from '../../utils/validation'
import { formatCurrency, formatPercentage } from '../../utils'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react'

interface LoanManagerProps {
  loans: Loan[]
  onUpdateLoans: (loans: Loan[]) => void
}

interface LoanCardProps {
  loan: Loan
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSave: () => void
  onCancel: () => void
  disabled: boolean
}

export function LoanManager({ loans, onUpdateLoans }: LoanManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Loan>>({})
  const [errors, setErrors] = useState<ValidationError[]>([])

  const resetForm = () => {
    setFormData({})
    setErrors([])
    setIsAdding(false)
    setEditingId(null)
  }

  const handleStartAdd = () => {
    setFormData({
      name: '',
      amount: 0,
      interestRate: 0,
      termYears: 25,
      startDate: new Date().toISOString().split('T')[0]
    })
    setIsAdding(true)
  }

  const handleStartEdit = (loan: Loan) => {
    setFormData({ ...loan })
    setEditingId(loan.id)
  }

  const calculateMonthlyPayment = (amount: number, rate: number, years: number): number => {
    if (rate === 0) return amount / (years * 12)
    const monthlyRate = rate / 100 / 12
    const numPayments = years * 12
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateLoan(formData)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    const monthlyPayment = calculateMonthlyPayment(
      formData.amount!,
      formData.interestRate!,
      formData.termYears!
    )

    const loanData: Loan = {
      id: editingId || generateId('loan'),
      name: formData.name!,
      amount: formData.amount!,
      interestRate: formData.interestRate!,
      termYears: formData.termYears!,
      startDate: formData.startDate!,
      monthlyPayment,
      remainingBalance: formData.remainingBalance || formData.amount!
    }

    if (editingId) {
      const updatedLoans = loans.map(loan => 
        loan.id === editingId ? loanData : loan
      )
      onUpdateLoans(updatedLoans)
    } else {
      onUpdateLoans([...loans, loanData])
    }

    resetForm()
  }

  const handleDelete = (loanId: string) => {
    const updatedLoans = loans.filter(loan => loan.id !== loanId)
    onUpdateLoans(updatedLoans)
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Loans ({loans.length})
        </h4>
        <Button
          size="sm"
          onClick={handleStartAdd}
          disabled={isAdding || editingId !== null}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Loan
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isAdding ? 'Add New Loan' : 'Edit Loan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan-name">Loan Name *</Label>
                <Input
                  id="loan-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mortgage, Car Loan"
                  required
                />
                {getFieldError('name') && (
                  <p className="text-sm text-destructive">{getFieldError('name')}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loan-amount">Amount (£) *</Label>
                  <Input
                    id="loan-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                  {getFieldError('amount') && (
                    <p className="text-sm text-destructive">{getFieldError('amount')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loan-rate">Interest Rate (%) *</Label>
                  <Input
                    id="loan-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.interestRate || ''}
                    onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                    required
                  />
                  {getFieldError('interestRate') && (
                    <p className="text-sm text-destructive">{getFieldError('interestRate')}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loan-term">Term (Years) *</Label>
                  <Input
                    id="loan-term"
                    type="number"
                    min="1"
                    value={formData.termYears || ''}
                    onChange={(e) => setFormData({ ...formData, termYears: parseInt(e.target.value) || 1 })}
                    required
                  />
                  {getFieldError('termYears') && (
                    <p className="text-sm text-destructive">{getFieldError('termYears')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loan-start">Start Date *</Label>
                  <Input
                    id="loan-start"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                  {getFieldError('startDate') && (
                    <p className="text-sm text-destructive">{getFieldError('startDate')}</p>
                  )}
                </div>
              </div>

              {formData.amount && formData.interestRate !== undefined && formData.termYears && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    <strong>Estimated Monthly Payment:</strong> £
                    {calculateMonthlyPayment(formData.amount, formData.interestRate, formData.termYears).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {isAdding ? 'Add Loan' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loans List */}
      {loans.length === 0 && !isAdding ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No loans attached to this asset
        </p>
      ) : (
        <div className="space-y-2">
          {loans.map((loan) => (
            <div key={loan.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex-1">
                <div className="font-medium">{loan.name}</div>
                <div className="text-sm text-muted-foreground">
                  £{(loan.remainingBalance || loan.amount).toLocaleString()} 
                  {' at '}{loan.interestRate}% 
                  {loan.monthlyPayment && ` • £${loan.monthlyPayment.toFixed(2)}/month`}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartEdit(loan)}
                  disabled={isAdding || editingId !== null}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(loan.id)}
                  disabled={isAdding || editingId !== null}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function LoanCard({ loan, isEditing, onEdit, onDelete, onSave, onCancel, disabled }: LoanCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (isEditing) {
    return (
      <div>Editing functionality not implemented</div>
    )
  }

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {loan.name}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              disabled={disabled}
              className={showDeleteConfirm ? "text-destructive" : ""}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Amount:</span> {formatCurrency(loan.amount)}
          </div>
          <div>
            <span className="font-medium">Rate:</span> {formatPercentage(loan.interestRate)}
          </div>
          <div>
            <span className="font-medium">Term:</span> {loan.termYears} years
          </div>
          <div>
            <span className="font-medium">Monthly:</span> {formatCurrency(loan.monthlyPayment || 0)}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="mt-3 p-2 border border-destructive rounded bg-destructive/10">
            <p className="text-xs text-destructive mb-2">Delete this loan?</p>
            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={onDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
