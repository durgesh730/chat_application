import React from 'react'
import ShowModal from '../../custom/ShowModal'

const MoreDetails = ({ open, setOpen, id }) => {
    return (
        <div>
            {id && (
                <ShowModal isOpen={open} onClose={() => setOpen(false)}>
                    <div className="p-2 md:p-4 max-w-full">
                        <div className="hidden lg:block">
                            <table className="text-left">
                                <tbody>
                                    <tr className="py-2">
                                        <th className="pr-4 font-semibold text-xs md:text-sm">First Name:</th>
                                        <td className={`${id.firstName ? "text-xs md:text-sm" : "text-red-500 text-xs md:text-sm"} break-words`}>{id.firstName || "Not Available"}</td>
                                    </tr>
                                    <tr className="py-2">
                                        <th className="pr-4 font-semibold text-xs md:text-sm">Last Name:</th>
                                        <td className={`${id.lastName ? "text-xs md:text-sm" : "text-red-500 text-xs md:text-sm"} break-words`}>{id.lastName || "Not Available"}</td>
                                    </tr>
                                    <tr className="py-2">
                                        <th className="pr-4 font-semibold text-xs md:text-sm">Email:</th>
                                        <td className={`${id.email ? "text-xs md:text-sm" : "text-red-500 text-xs md:text-sm"} break-words`}>{id.email || "Not Available"}</td>
                                    </tr>
                                    <tr className="py-2">
                                        <th className="pr-4 font-semibold text-xs md:text-sm">Phone Number:</th>
                                        <td className={`${id.telephone ? "text-xs md:text-sm" : "text-red-500 text-xs md:text-sm"} break-words`}>{id.telephone || "-"}</td>
                                    </tr>
                                    <tr className="py-2">
                                        <th className="pr-4 font-semibold text-xs md:text-sm">Address:</th>
                                        <td className={`${id.address ? "text-xs md:text-sm" : "text-red-500 text-xs md:text-sm"} break-words`}>{id.address || "Not Available"}</td>
                                    </tr>
                                    <tr className="py-2">
                                        <th className="pr-4 font-semibold text-xs md:text-sm">City:</th>
                                        <td className={`${id.city ? "text-xs md:text-sm" : "text-red-500 text-xs md:text-sm"} break-words`}>{id.city || "Not Available"}</td>
                                    </tr>
                                    <tr className="py-2">
                                        <th className="pr-4 font-semibold text-xs md:text-sm">Country:</th>
                                        <td className={`${id.country ? "text-xs md:text-sm" : "text-red-500 text-xs md:text-sm"} break-words`}>{id.country || "Not Available"}</td>
                                    </tr>
                                    <tr className="py-2">
                                        <th className="pr-4 font-semibold text-xs md:text-sm">Pincode:</th>
                                        <td className={`${id.pincode ? "text-xs md:text-sm" : "text-red-500 text-xs md:text-sm"} break-words`}>{id.pincode || "Not Available"}</td>
                                    </tr>
                                    <tr className="py-2">
                                        <th className="pr-4 font-semibold text-xs md:text-sm">Role:</th>
                                        <td className={`${id.role ? "text-xs md:text-sm" : "text-red-500 text-xs md:text-sm"} break-words`}>{id.role || "Not Available"}</td>
                                    </tr>
                                    <tr className="py-2">
                                        <th className="pr-4 font-semibold text-xs md:text-sm">Status:</th>
                                        <td className={id.active ? "text-green-600 font-semibold" : "text-red-500"}>{id.active ? "Active" : "Disable"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="block lg:hidden">
                            <div className="space-y-4">
                                <div>
                                    <span className="font-semibold">First Name: </span>
                                    <span className={id.firstName ? "" : "text-red-500"}>{id.firstName || "Not Available"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Last Name: </span>
                                    <span className={id.lastName ? "" : "text-red-500"}>{id.lastName || "Not Available"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Email: </span>
                                    <span className={id.email ? "" : "text-red-500"}>{id.email || "Not Available"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Phone Number: </span>
                                    <span className={id.telephone ? "" : "text-red-500"}>{id.telephone || "-"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Address: </span>
                                    <span className={id.address ? "" : "text-red-500"}>{id.address || "Not Available"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">City: </span>
                                    <span className={id.city ? "" : "text-red-500"}>{id.city || "Not Available"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Country: </span>
                                    <span className={id.country ? "" : "text-red-500"}>{id.country || "Not Available"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Pincode: </span>
                                    <span className={id.pincode ? "" : "text-red-500"}>{id.pincode || "Not Available"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Role: </span>
                                    <span className={id.role ? "" : "text-red-500"}>{id.role || "Not Available"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Status: </span>
                                    <span className={id.active ? "text-green-600 font-semibold" : "text-red-500"}>{id.active ? "Active" : "Disable"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ShowModal>
            )}

        </div>
    )
}

export default MoreDetails
