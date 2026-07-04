package controllers

import (
	"time"

	"github.com/gofiber/fiber/v3"

	"sectionlap/backend/middlewares"
	"sectionlap/backend/models"
	"sectionlap/backend/repositories"
	"sectionlap/backend/services"
)

type TeacherWalletController struct {
	walletRepo  repositories.TeacherWalletRepository
	sectionRepo repositories.SectionRepository
	presigner   *services.R2Presigner
	slip2go     *services.Slip2GoClient
}

func NewTeacherWalletController(
	walletRepo repositories.TeacherWalletRepository,
	sectionRepo repositories.SectionRepository,
	presigner *services.R2Presigner,
	slip2go *services.Slip2GoClient,
) *TeacherWalletController {
	return &TeacherWalletController{walletRepo: walletRepo, sectionRepo: sectionRepo, presigner: presigner, slip2go: slip2go}
}

type UpsertWalletBody struct {
	QrCodeR2Key       string `json:"qrCodeR2Key"`
	BankAccountNameTH string `json:"bankAccountNameTh"`
	BankAccountNumber string `json:"bankAccountNumber"`
}

func (ctrl *TeacherWalletController) Upsert(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var body UpsertWalletBody
	if err := c.Bind().JSON(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if body.BankAccountNameTH == "" || body.BankAccountNumber == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "bankAccountNameTh and bankAccountNumber are required"})
	}

	wallet := &models.TeacherWallet{
		TeacherID:         userID,
		QrCodeR2Key:       body.QrCodeR2Key,
		BankAccountNameTH: body.BankAccountNameTH,
		BankAccountNumber: body.BankAccountNumber,
		UpdatedAt:         time.Now().UTC(),
	}
	if err := ctrl.walletRepo.Upsert(c.Context(), wallet); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save wallet"})
	}
	return c.JSON(fiber.Map{"data": wallet, "error": nil, "status": "success"})
}

type TestSlipBody struct {
	QrCode string `json:"qrCode"`
}

// TestSlip lets a teacher upload any slip where they were the receiver,
// so we save the receiver name/last-4-digits exactly as Slip2Go reports
// them — sidesteps mismatches from manually-typed names (titles, spacing,
// truncation) that would otherwise break payment verification later.
func (ctrl *TeacherWalletController) TestSlip(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var body TestSlipBody
	if err := c.Bind().JSON(&body); err != nil || body.QrCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "qrCode is required"})
	}
	if ctrl.slip2go == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "slip2go is not configured"})
	}

	info, err := ctrl.slip2go.GetSlipInfo(c.Context(), body.QrCode)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	wallet, _ := ctrl.walletRepo.GetByTeacherID(c.Context(), userID)
	if wallet == nil {
		wallet = &models.TeacherWallet{TeacherID: userID}
	}
	wallet.BankAccountNameTH = info.ReceiverName
	wallet.BankAccountNumber = info.ReceiverLast4
	wallet.UpdatedAt = time.Now().UTC()

	if err := ctrl.walletRepo.Upsert(c.Context(), wallet); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save wallet"})
	}
	return c.JSON(fiber.Map{"data": wallet, "error": nil, "status": "success"})
}

func (ctrl *TeacherWalletController) Get(c fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	wallet, err := ctrl.walletRepo.GetByTeacherID(c.Context(), userID)
	if err != nil {
		return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
	}
	ctrl.presignQr(c, wallet)
	return c.JSON(fiber.Map{"data": wallet, "error": nil, "status": "success"})
}

// GetForSection is public — resolves section -> teacher -> wallet, so a student
// deciding how to pay for a booking can see the teacher's QR/bank info without
// an arbitrary teacherId lookup endpoint existing.
func (ctrl *TeacherWalletController) GetForSection(c fiber.Ctx) error {
	sectionID := c.Params("id")

	section, err := ctrl.sectionRepo.GetByID(c.Context(), sectionID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "section not found"})
	}

	wallet, err := ctrl.walletRepo.GetByTeacherID(c.Context(), section.TeacherID)
	if err != nil {
		return c.JSON(fiber.Map{"data": nil, "error": nil, "status": "success"})
	}
	ctrl.presignQr(c, wallet)
	return c.JSON(fiber.Map{"data": wallet, "error": nil, "status": "success"})
}

func (ctrl *TeacherWalletController) presignQr(c fiber.Ctx, wallet *models.TeacherWallet) {
	if ctrl.presigner == nil || wallet.QrCodeR2Key == "" {
		return
	}
	if url, err := ctrl.presigner.PresignGetURL(c.Context(), wallet.QrCodeR2Key); err == nil {
		wallet.QrCodeURL = url
	}
}
